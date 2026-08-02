import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  writeBatch,
  type WriteBatch,
} from "firebase/firestore";
import { FirebaseError } from "firebase/app";

import { db } from "../config/firebase";
import type {
  CurriculumComparisonSummary,
  CurriculumImportActor,
  CurriculumImportDraft,
  CurriculumImportSummary,
  CurriculumValidationIssue,
  CurriculumValidationReport,
  ExtractedCourseUnitDraft,
} from "../models/CurriculumImport";
import type { Programme, ProgrammeLevel } from "../models/Programme";

const WRITE_CHUNK_SIZE = 15;
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const normalise = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, "");
const sameValue = (a: unknown, b: unknown) => String(a ?? "") === String(b ?? "");

function inferLevel(award?: string): ProgrammeLevel {
  const value = (award ?? "").toLowerCase();
  if (value.includes("higher diploma")) return "Higher Diploma";
  if (value.includes("diploma")) return "Diploma";
  if (value.includes("certificate")) return "Certificate";
  if (value.includes("master")) return "Master's";
  if (value.includes("phd") || value.includes("doctor")) return "PhD";
  if (value.includes("postgraduate")) return "Postgraduate Diploma";
  return "Degree";
}

async function loadCatalogue() {
  const [programmeSnapshot, courseSnapshot, moduleSnapshot] = await Promise.all([
    getDocs(collection(db, "programmes")),
    getDocs(collection(db, "courses")),
    getDocs(collection(db, "modules")),
  ]);
  return {
    programmes: programmeSnapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Programme)),
    courses: courseSnapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Record<string, unknown> & { id: string })),
    modules: moduleSnapshot.docs.map((item) => ({ id: item.id, ...item.data() } as Record<string, unknown> & { id: string })),
  };
}

export async function compareCurriculumDraft(draft: CurriculumImportDraft): Promise<CurriculumComparisonSummary> {
  const catalogue = await loadCatalogue();
  const matchedProgramme = catalogue.programmes.find((item) =>
    normalise(item.code || item.title) === normalise(draft.programme.code || draft.programme.title)
  );
  let newCourseUnits = 0;
  let matchingCourseUnits = 0;
  let changedCourseUnits = 0;
  let newModules = 0;
  let matchingModules = 0;

  for (const unit of draft.courseUnits) {
    const match = catalogue.courses.find((item) =>
      (!matchedProgramme || item.programmeId === matchedProgramme.id) &&
      normalise(String(item.code || item.title || "")) === normalise(unit.code || unit.title)
    );
    if (!match) {
      newCourseUnits += 1;
      newModules += unit.modules.length;
      continue;
    }
    matchingCourseUnits += 1;
    if (
      !sameValue(match.creditUnits, unit.creditUnits) ||
      !sameValue(match.contactHours, unit.contactHours) ||
      !sameValue(match.semester, unit.semester) ||
      !sameValue(match.yearOfStudy, unit.yearOfStudy)
    ) changedCourseUnits += 1;
    unit.modules.forEach((module) => {
      const moduleMatch = catalogue.modules.find((item) =>
        (item.courseUnitId === match.id || item.courseId === match.id) &&
        normalise(String(item.code || item.title || "")) === normalise(module.code || module.title)
      );
      if (moduleMatch) matchingModules += 1;
      else newModules += 1;
    });
  }
  return { newCourseUnits, matchingCourseUnits, changedCourseUnits, newModules, matchingModules };
}

export async function validateCurriculumDraft(
  draft: CurriculumImportDraft,
  comparison: CurriculumComparisonSummary | null
): Promise<CurriculumValidationReport> {
  const issues: CurriculumValidationIssue[] = [];
  const includedUnits = draft.courseUnits.filter((unit) => unit.decision !== "skip");

  if (!draft.programme.title.trim()) {
    issues.push({ severity: "error", code: "PROGRAMME_TITLE_REQUIRED", message: "Programme title is required.", path: "programme.title" });
  }
  if (!includedUnits.length) {
    issues.push({ severity: "error", code: "COURSE_UNIT_REQUIRED", message: "At least one course unit must be included." });
  }

  const seenUnitKeys = new Set<string>();
  let moduleCount = 0;
  let learningOutcomeCount = 0;
  let lowConfidenceCount = Number((draft.programme.confidence ?? 0) < 80);

  includedUnits.forEach((unit, unitIndex) => {
    const path = `courseUnits.${unitIndex}`;
    if (!unit.title.trim()) issues.push({ severity: "error", code: "COURSE_TITLE_REQUIRED", message: `Course Unit ${unitIndex + 1} has no title.`, path });
    const key = normalise(unit.code || unit.title);
    if (key && seenUnitKeys.has(key)) issues.push({ severity: "warning", code: "DUPLICATE_COURSE_IN_FILE", message: `Duplicate course unit detected in the uploaded file: ${unit.code || unit.title}.`, path });
    if (key) seenUnitKeys.add(key);
    if (!unit.code) issues.push({ severity: "warning", code: "COURSE_CODE_MISSING", message: `${unit.title || `Course Unit ${unitIndex + 1}`} has no code.`, path });
    if (unit.creditUnits == null) issues.push({ severity: "warning", code: "CREDIT_UNITS_MISSING", message: `${unit.title || `Course Unit ${unitIndex + 1}`} has no credit units.`, path });
    if (unit.contactHours == null) issues.push({ severity: "warning", code: "CONTACT_HOURS_MISSING", message: `${unit.title || `Course Unit ${unitIndex + 1}`} has no contact hours.`, path });
    const componentHours = (unit.lectureHours || 0) + (unit.tutorialHours || 0) + (unit.practicalHours || 0) + (unit.clinicalHours || 0) + (unit.assessmentHours || 0);
    if (unit.contactHours != null && componentHours > 0 && componentHours !== unit.contactHours) {
      issues.push({ severity: "warning", code: "CONTACT_HOURS_MISMATCH", message: `${unit.title}: component hours total ${componentHours}, but contact hours are ${unit.contactHours}.`, path });
    }
    if ((unit.confidence ?? 0) < 80) lowConfidenceCount += 1;
    learningOutcomeCount += unit.learningOutcomes?.length || 0;

    const seenModuleKeys = new Set<string>();
    unit.modules.filter((module) => module.decision !== "skip").forEach((module, moduleIndex) => {
      moduleCount += 1;
      learningOutcomeCount += module.learningOutcomes?.length || 0;
      const moduleKey = normalise(module.code || module.title);
      if (!module.title.trim()) issues.push({ severity: "error", code: "MODULE_TITLE_REQUIRED", message: `${unit.title}: Module ${moduleIndex + 1} has no title.`, path: `${path}.modules.${moduleIndex}` });
      if (moduleKey && seenModuleKeys.has(moduleKey)) issues.push({ severity: "warning", code: "DUPLICATE_MODULE_IN_FILE", message: `${unit.title}: duplicate module ${module.code || module.title}.`, path: `${path}.modules.${moduleIndex}` });
      if (moduleKey) seenModuleKeys.add(moduleKey);
      if ((module.confidence ?? 0) < 80) lowConfidenceCount += 1;
    });
  });

  if (draft.analysisMethod === "heuristic") {
    issues.push({ severity: "warning", code: "HEURISTIC_ANALYSIS", message: "AI analysis was unavailable; all detected fields require careful manual review." });
  }

  const duplicateCount = (comparison?.matchingCourseUnits || 0) + (comparison?.matchingModules || 0);
  const errorCount = issues.filter((item) => item.severity === "error").length;
  const warningCount = issues.filter((item) => item.severity === "warning").length;
  const readinessScore = Math.max(0, Math.min(100, 100 - errorCount * 20 - warningCount * 3 - lowConfidenceCount * 2));

  return {
    valid: errorCount === 0,
    readinessScore,
    programmeCount: draft.programme.decision === "skip" ? 0 : 1,
    courseUnitCount: includedUnits.length,
    moduleCount,
    learningOutcomeCount,
    duplicateCount,
    lowConfidenceCount,
    issues,
    validatedAt: new Date().toISOString(),
  };
}

type BatchOperation = (batch: WriteBatch) => void;

async function commitOperations(operations: BatchOperation[]) {
  for (let index = 0; index < operations.length; index += WRITE_CHUNK_SIZE) {
    const batch = writeBatch(db);
    operations.slice(index, index + WRITE_CHUNK_SIZE).forEach((operation) => operation(batch));
    await batch.commit();
  }
}

function friendlyImportError(error: unknown): Error {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied") {
      return new Error("Permission denied while saving the curriculum. Confirm that your user profile is active and has the tutor or administrator role, then sign out and sign in again.");
    }
    if (error.code === "unauthenticated") return new Error("Your session has expired. Sign in again before importing.");
    if (error.code === "resource-exhausted") return new Error("Firestore temporarily rejected the import because a quota or write limit was reached. Wait briefly and retry.");
    if (error.code === "unavailable") return new Error("Firestore is temporarily unavailable. Check your connection and retry.");
    return new Error(`Firestore import failed (${error.code}): ${error.message}`);
  }
  return error instanceof Error ? error : new Error("The curriculum import failed for an unknown reason.");
}

export async function importCurriculumDraft(
  draft: CurriculumImportDraft,
  selectedProgramme: Programme | null,
  actor: CurriculumImportActor
): Promise<CurriculumImportSummary> {
  const startedAt = performance.now();
  if (actor.role !== "admin" && actor.role !== "tutor") throw new Error("Only administrators and tutors may import curricula.");

  try {
    const catalogue = await loadCatalogue();
    const programmeMatch = selectedProgramme ?? catalogue.programmes.find((item) =>
      normalise(item.code || item.title) === normalise(draft.programme.code || draft.programme.title)
    ) ?? null;

    const operations: BatchOperation[] = [];
    let programmeId = programmeMatch?.id ?? "";
    let programmeCreated = false;
    if (!programmeId) {
      const programmeRef = doc(collection(db, "programmes"));
      programmeId = programmeRef.id;
      programmeCreated = true;
      operations.push((batch) => batch.set(programmeRef, {
        id: programmeRef.id,
        title: draft.programme.title.trim(),
        slug: `${slugify(draft.programme.title)}-${programmeRef.id.slice(0, 6)}`,
        level: inferLevel(draft.programme.award),
        department: draft.programme.department || "",
        description: draft.programme.description || "Imported curriculum",
        duration: draft.programme.durationYears ? `${draft.programme.durationYears} years` : "To be defined",
        code: draft.programme.code || "",
        yearsOfStudy: draft.programme.durationYears || null,
        totalCourseUnits: draft.courseUnits.filter((unit) => unit.decision !== "skip").length,
        totalCredits: draft.courseUnits.reduce((sum, unit) => sum + (unit.creditUnits || 0), 0),
        createdBy: actor.uid,
        createdByEmail: actor.email,
        createdByRole: actor.role,
        published: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        importSource: draft.sourceFileName,
      }));
    }

    let courseUnitsCreated = 0;
    let courseUnitsMerged = 0;
    let modulesCreated = 0;
    let modulesMerged = 0;
    let duplicatesSkipped = 0;

    for (const unit of draft.courseUnits) {
      if (unit.decision === "skip" || !unit.title.trim()) { duplicatesSkipped += 1; continue; }
      const existingCourse = catalogue.courses.find((item) =>
        item.programmeId === programmeId &&
        normalise(String(item.code || item.title || "")) === normalise(unit.code || unit.title)
      );
      let courseId = existingCourse?.id ?? "";
      if (existingCourse && unit.decision !== "create") {
        courseUnitsMerged += 1;
        operations.push((batch) => batch.update(doc(db, "courses", existingCourse.id), coursePayload(unit, programmeId, draft.programme.title, actor, draft.sourceFileName)));
      } else if (existingCourse && unit.decision === "create") {
        duplicatesSkipped += 1;
        continue;
      } else {
        const courseRef = doc(collection(db, "courses"));
        courseId = courseRef.id;
        courseUnitsCreated += 1;
        operations.push((batch) => batch.set(courseRef, {
          id: courseRef.id,
          slug: `${slugify(unit.title)}-${courseRef.id.slice(0, 6)}`,
          ...coursePayload(unit, programmeId, draft.programme.title, actor, draft.sourceFileName),
          createdAt: serverTimestamp(),
        }));
      }

      unit.modules.forEach((module, index) => {
        if (module.decision === "skip" || !module.title.trim()) { duplicatesSkipped += 1; return; }
        const existingModule = catalogue.modules.find((item) =>
          (item.courseUnitId === courseId || item.courseId === courseId) &&
          normalise(String(item.code || item.title || "")) === normalise(module.code || module.title)
        );
        if (existingModule && module.decision !== "create") {
          modulesMerged += 1;
          operations.push((batch) => batch.update(doc(db, "modules", existingModule.id), {
            title: module.title.trim(), code: module.code || "", description: module.description || "",
            estimatedHours: module.estimatedHours || null,
            duration: module.estimatedHours ? `${module.estimatedHours} hours` : "To be defined",
            learningOutcomes: module.learningOutcomes || [], topics: module.topics || [],
            updatedAt: serverTimestamp(), importSource: draft.sourceFileName,
            updatedBy: actor.uid, updatedByEmail: actor.email, updatedByRole: actor.role,
          }));
        } else if (existingModule && module.decision === "create") {
          duplicatesSkipped += 1;
        } else {
          const moduleRef = doc(collection(db, "modules"));
          modulesCreated += 1;
          operations.push((batch) => batch.set(moduleRef, {
            id: moduleRef.id, programmeId, programmeTitle: draft.programme.title,
            courseUnitId: courseId, courseUnitTitle: unit.title.trim(), courseId,
            title: module.title.trim(), description: module.description || "", code: module.code || "",
            estimatedHours: module.estimatedHours || null, learningOutcomes: module.learningOutcomes || [], topics: module.topics || [],
            order: index + 1, passMark: 50,
            duration: module.estimatedHours ? `${module.estimatedHours} hours` : "To be defined",
            lessons: 0, published: false,
            createdBy: actor.uid, createdByEmail: actor.email, createdByRole: actor.role,
            createdAt: serverTimestamp(), updatedAt: serverTimestamp(), importSource: draft.sourceFileName,
          }));
        }
      });
    }

    const auditRef = doc(collection(db, "curriculumImports"));
    operations.push((batch) => batch.set(auditRef, {
      id: auditRef.id, sourceFileName: draft.sourceFileName, programmeId,
      programmeTitle: draft.programme.title,
      importedBy: actor.uid, importedByUid: actor.uid, importedByEmail: actor.email,
      importedByName: actor.fullName || actor.email, importedByRole: actor.role,
      analysisMethod: draft.analysisMethod, aiProvider: draft.aiProvider || null,
      analysisDurationMs: draft.analysisDurationMs || null,
      courseUnitsCreated, courseUnitsMerged, modulesCreated, modulesMerged, duplicatesSkipped,
      warnings: draft.warnings, status: "completed", createdAt: serverTimestamp(),
    }));

    await commitOperations(operations);
    return {
      programmeId, programmeCreated, courseUnitsCreated, courseUnitsMerged,
      modulesCreated, modulesMerged, duplicatesSkipped, auditId: auditRef.id,
      importedByRole: actor.role,
      elapsedMs: Math.round(performance.now() - startedAt),
      warnings: draft.warnings,
    };
  } catch (error) {
    throw friendlyImportError(error);
  }
}

function coursePayload(
  unit: ExtractedCourseUnitDraft,
  programmeId: string,
  programmeTitle: string,
  actor: CurriculumImportActor,
  sourceFileName: string
) {
  return {
    programmeId, programmeTitle, title: unit.title.trim(), category: "Imported Curriculum",
    description: unit.description || "", level: "Diploma", code: unit.code || "",
    semester: unit.semester || null, yearOfStudy: unit.yearOfStudy || null,
    creditUnits: unit.creditUnits || null, contactHours: unit.contactHours || null,
    lectureHours: unit.lectureHours || null, tutorialHours: unit.tutorialHours || null,
    practicalHours: unit.practicalHours || null, clinicalHours: unit.clinicalHours || null,
    assessmentHours: unit.assessmentHours || null, prerequisites: unit.prerequisites || [],
    learningOutcomes: unit.learningOutcomes || [], image: "", tutor: "Unassigned",
    duration: unit.contactHours ? `${unit.contactHours} hours` : "To be defined",
    modules: unit.modules.length, lessons: 0, rating: 0, students: "0", certificate: false,
    isFeatured: false, isNew: true, published: false,
    createdBy: actor.uid, updatedBy: actor.uid,
    createdByEmail: actor.email, updatedByEmail: actor.email,
    createdByRole: actor.role, updatedByRole: actor.role,
    updatedAt: serverTimestamp(), importSource: sourceFileName,
  };
}
