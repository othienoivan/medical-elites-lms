import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { CourseUnit } from "../models/CourseUnit";
import { requireAccessScope, type AccessScope } from "./accessScope";
import { getAllProgrammes } from "./programmes";

const COLLECTION = "courses";
const ENROLMENTS_COLLECTION = "enrollments";
const STUDENTS_COLLECTION = "students";
const USERS_COLLECTION = "users";

function fromDoc(id: string, data: Record<string, unknown>): CourseUnit {
  const record = data as Partial<CourseUnit> & Record<string, unknown>;
  const title = String(record.title ?? "Untitled course unit");
  return {
    ...(record as Omit<CourseUnit, "id">),
    id,
    title,
    slug: String(record.slug ?? title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")),
    programmeId: String(record.programmeId ?? ""),
    programmeTitle: String(record.programmeTitle ?? "Health Sciences"),
    category: String(record.category ?? "Health Sciences"),
    description: String(record.description ?? "Explore this Medical Elites course unit."),
    image: String(record.image ?? record.imageUrl ?? record.thumbnailUrl ?? "/images/course-placeholder.svg"),
    tutor: String(record.tutor ?? record.tutorName ?? record.assignedTutorName ?? record.createdByName ?? "Medical Elites Tutor"),
    duration: String(record.duration ?? "Self-paced"),
    modules: Number(record.modules ?? record.moduleCount ?? 0),
    lessons: Number(record.lessons ?? record.lessonCount ?? 0),
    level: (record.level ?? "Diploma") as CourseUnit["level"],
    rating: Number(record.rating ?? record.ratingAverage ?? 0),
    students: String(record.students ?? record.studentCount ?? record.enrollmentCount ?? "0"),
    certificate: record.certificate !== false,
    isFeatured: record.isFeatured === true,
    published: record.published === true,
  };
}

function dedupe(rows: CourseUnit[]): CourseUnit[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()].sort((a, b) =>
    String(a.title ?? "").localeCompare(String(b.title ?? ""))
  );
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  ) as T;
}

function addStringId(ids: Set<string>, value: unknown): void {
  if (typeof value === "string" && value.trim().length > 0) {
    ids.add(value.trim());
  }
}

function addStringArray(ids: Set<string>, value: unknown): void {
  if (!Array.isArray(value)) return;
  value.forEach((item) => addStringId(ids, item));
}

function isActiveEnrolment(enrolment: Record<string, unknown>): boolean {
  if (enrolment.active === true) return true;

  const status = String(enrolment.status ?? enrolment.approvalStatus ?? "")
    .trim()
    .toLowerCase();

  return ["active", "approved", "enrolled", "accepted", "completed"].includes(status);
}

function hasPublishedState(courseUnit: CourseUnit): boolean {
  const record = courseUnit as CourseUnit & {
    isPublished?: unknown;
    status?: unknown;
    publicationStatus?: unknown;
  };

  return [record.published, record.isPublished, record.status, record.publicationStatus].some(
    (value) => {
      if (value === true) return true;
      return ["true", "published", "active", "live", "yes", "1"].includes(
        String(value ?? "").trim().toLowerCase()
      );
    }
  );
}

async function resolveCourseUnit(courseId: string): Promise<CourseUnit | null> {
  const directSnapshot = await getDoc(doc(db, COLLECTION, courseId));
  if (directSnapshot.exists()) {
    return fromDoc(directSnapshot.id, directSnapshot.data());
  }

  const byCourseIdSnapshot = await getDocs(
    query(collection(db, COLLECTION), where("courseId", "==", courseId))
  );
  if (!byCourseIdSnapshot.empty) {
    const match = byCourseIdSnapshot.docs[0];
    return fromDoc(match.id, match.data());
  }

  const byIdFieldSnapshot = await getDocs(
    query(collection(db, COLLECTION), where("id", "==", courseId))
  );
  if (!byIdFieldSnapshot.empty) {
    const match = byIdFieldSnapshot.docs[0];
    return fromDoc(match.id, match.data());
  }

  return null;
}

/**
 * Resolves a course unit from a route identifier.
 *
 * The current application contains both canonical Firestore document IDs and
 * legacy values stored in `courseId`, `id`, or `slug`. This resolver keeps old
 * links working while new links continue to use the canonical document ID.
 */
export async function getCourseUnitByIdentifier(
  identifier: string
): Promise<CourseUnit | null> {
  const cleanIdentifier = decodeURIComponent(identifier).trim();
  if (!cleanIdentifier) return null;

  const direct = await resolveCourseUnit(cleanIdentifier);
  if (direct) return direct;

  const bySlugSnapshot = await getDocs(
    query(collection(db, COLLECTION), where("slug", "==", cleanIdentifier))
  );
  if (!bySlugSnapshot.empty) {
    const match = bySlugSnapshot.docs[0];
    return fromDoc(match.id, match.data());
  }

  return null;
}

export async function createCourseUnit(courseUnit: CourseUnit): Promise<string> {
  const { id: _id, ...payload } = courseUnit;
  void _id;
  const docRef = await addDoc(
    collection(db, COLLECTION),
    removeUndefined({
      ...payload,
      institutionId: payload.institutionId ?? null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  await updateDoc(doc(db, COLLECTION, docRef.id), { id: docRef.id });
  return docRef.id;
}

export async function getAllCourseUnits(scope: AccessScope): Promise<CourseUnit[]> {
  const access = requireAccessScope(scope);

  if (access.role === "student") {
    const assignedIds = new Set<string>();
    addStringArray(assignedIds, access.assignedCourseUnitIds);

    const [studentDocumentResult, userDocumentResult] = await Promise.allSettled([
      getDoc(doc(db, STUDENTS_COLLECTION, access.uid)),
      getDoc(doc(db, USERS_COLLECTION, access.uid)),
    ]);

    if (studentDocumentResult.status === "fulfilled" && studentDocumentResult.value.exists()) {
      const studentData = studentDocumentResult.value.data() as Record<string, unknown>;
      addStringId(assignedIds, studentData.courseUnitId);
      addStringId(assignedIds, studentData.courseId);
      addStringArray(assignedIds, studentData.courseUnitIds);
      addStringArray(assignedIds, studentData.assignedCourseUnitIds);
    }

    if (userDocumentResult.status === "fulfilled" && userDocumentResult.value.exists()) {
      const userData = userDocumentResult.value.data() as Record<string, unknown>;
      addStringId(assignedIds, userData.courseUnitId);
      addStringId(assignedIds, userData.courseId);
      addStringArray(assignedIds, userData.courseUnitIds);
      addStringArray(assignedIds, userData.assignedCourseUnitIds);
    }

    const enrolmentResults = await Promise.allSettled([
      getDocs(
        query(
          collection(db, ENROLMENTS_COLLECTION),
          where("userId", "==", access.uid)
        )
      ),
      getDocs(
        query(
          collection(db, ENROLMENTS_COLLECTION),
          where("studentAuthUid", "==", access.uid)
        )
      ),
      getDocs(
        query(
          collection(db, ENROLMENTS_COLLECTION),
          where("studentId", "==", access.uid)
        )
      ),
    ]);

    enrolmentResults.forEach((result) => {
      if (result.status !== "fulfilled") {
        console.warn("An enrolment query failed and was skipped:", result.reason);
        return;
      }

      result.value.docs.forEach((enrolmentDocument) => {
        const enrolment = enrolmentDocument.data() as Record<string, unknown>;
        if (!isActiveEnrolment(enrolment)) return;

        addStringId(assignedIds, enrolment.courseId);
        addStringId(assignedIds, enrolment.courseUnitId);
        addStringArray(assignedIds, enrolment.courseIds);
        addStringArray(assignedIds, enrolment.courseUnitIds);
        addStringArray(assignedIds, enrolment.assignedCourseUnitIds);
      });
    });

    if (assignedIds.size === 0) return [];

    const courseResults = await Promise.allSettled(
      [...assignedIds].map((courseId) => resolveCourseUnit(courseId))
    );

    const rows = courseResults.flatMap((result) => {
      if (result.status === "fulfilled" && result.value) return [result.value];
      if (result.status === "rejected") {
        console.warn("An assigned course unit could not be loaded:", result.reason);
      }
      return [];
    });

    return dedupe(rows);
  }

  if (access.role === "admin" && access.institutionId) {
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), where("institutionId", "==", access.institutionId))
    );
    return dedupe(snapshot.docs.map((item) => fromDoc(item.id, item.data())));
  }

  const visibleProgrammeIds = (await getAllProgrammes(access)).map((item) => item.id);
  const programmeQueries = visibleProgrammeIds.map((programmeId) =>
    getDocs(query(collection(db, COLLECTION), where("programmeId", "==", programmeId)))
  );
  const results = await Promise.allSettled([
    getDocs(query(collection(db, COLLECTION), where("ownerUserId", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("createdByUid", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("createdBy", "==", access.uid))),
    getDocs(
      query(collection(db, COLLECTION), where("assignedTutorIds", "array-contains", access.uid))
    ),
    ...programmeQueries,
  ]);

  const rows = results.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return result.value.docs.map((item) => fromDoc(item.id, item.data()));
    }

    console.warn(`Course-unit ownership query ${index + 1} failed and was skipped:`, result.reason);
    return [];
  });

  if (rows.length === 0 && results.every((result) => result.status === "rejected")) {
    throw results[0].status === "rejected"
      ? results[0].reason
      : new Error("Unable to load course units.");
  }

  return dedupe(rows);
}

export async function getPublishedCourseUnits(): Promise<CourseUnit[]> {
  // The canonical public publication field is `published`. New and edited
  // course units already persist this field through the administration pages.
  // Keeping the public query explicit also satisfies Firestore's rule/query model.
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), where("published", "==", true))
  );
  return dedupe(snapshot.docs.map((item) => fromDoc(item.id, item.data())));
}

export async function getCourseUnits(scope: AccessScope): Promise<CourseUnit[]> {
  const access = requireAccessScope(scope);
  const courseUnits = await getAllCourseUnits(access);
  return access.role === "student" ? courseUnits : courseUnits.filter(hasPublishedState);
}

export async function updateCourseUnit(id: string, data: Partial<CourseUnit>): Promise<void> {
  const { id: _id, ...payload } = data;
  void _id;
  await updateDoc(
    doc(db, COLLECTION, id),
    removeUndefined({ ...payload, updatedAt: serverTimestamp() })
  );
}

async function getManagedLinkedDocuments(
  collectionName: "modules" | "lessons",
  courseUnitId: string,
  scope: AccessScope
) {
  const access = requireAccessScope(scope);
  const base = collection(db, collectionName);
  const queries =
    access.role === "admin" && access.institutionId
      ? [
          query(
            base,
            where("courseUnitId", "==", courseUnitId),
            where("institutionId", "==", access.institutionId)
          ),
        ]
      : [
          query(
            base,
            where("courseUnitId", "==", courseUnitId),
            where("ownerUserId", "==", access.uid)
          ),
          query(
            base,
            where("courseUnitId", "==", courseUnitId),
            where("createdByUid", "==", access.uid)
          ),
          query(
            base,
            where("courseUnitId", "==", courseUnitId),
            where("assignedTutorIds", "array-contains", access.uid)
          ),
        ];

  const results = await Promise.allSettled(queries.map((item) => getDocs(item)));
  const documents = results.flatMap((result) =>
    result.status === "fulfilled" ? result.value.docs : []
  );
  return [...new Map(documents.map((item) => [item.id, item])).values()];
}

export async function countCourseUnitModules(
  courseUnitId: string,
  scope: AccessScope
): Promise<number> {
  return (await getManagedLinkedDocuments("modules", courseUnitId, scope)).length;
}

export async function deleteCourseUnit(id: string, scope: AccessScope): Promise<void> {
  const linked = await countCourseUnitModules(id, scope);
  if (linked > 0) {
    throw new Error(
      `This course unit has ${linked} linked module${
        linked === 1 ? "" : "s"
      }. Merge it or remove its modules first.`
    );
  }
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function mergeCourseUnits(
  sourceId: string,
  targetId: string,
  scope: AccessScope
): Promise<void> {
  if (sourceId === targetId) throw new Error("Choose two different course units.");
  const [sourceSnap, targetSnap] = await Promise.all([
    getDoc(doc(db, COLLECTION, sourceId)),
    getDoc(doc(db, COLLECTION, targetId)),
  ]);
  if (!sourceSnap.exists() || !targetSnap.exists()) {
    throw new Error("One of the selected course units no longer exists.");
  }

  const [moduleDocs, lessonDocs] = await Promise.all([
    getManagedLinkedDocuments("modules", sourceId, scope),
    getManagedLinkedDocuments("lessons", sourceId, scope),
  ]);
  const target = targetSnap.data() as Record<string, unknown>;
  const batch = writeBatch(db);
  moduleDocs.forEach((item) =>
    batch.update(item.ref, {
      courseUnitId: targetId,
      courseId: targetId,
      courseUnitTitle: target.title ?? "",
      programmeId: target.programmeId ?? null,
      programmeTitle: target.programmeTitle ?? "",
      updatedAt: serverTimestamp(),
    })
  );
  lessonDocs.forEach((item) =>
    batch.update(item.ref, {
      courseUnitId: targetId,
      courseUnitTitle: target.title ?? "",
      programmeId: target.programmeId ?? null,
      programmeTitle: target.programmeTitle ?? "",
      updatedAt: serverTimestamp(),
    })
  );
  batch.delete(sourceSnap.ref);
  await batch.commit();
}
