import { generateAiResponse } from "../firebase/aiAssistant";
import type {
  CurriculumImportDraft,
  ExtractedCourseUnitDraft,
  ExtractedModuleDraft,
} from "../models/CurriculumImport";

const uid = () => crypto.randomUUID();
const MAX_CONTEXT_CHARS = 55_000;

function numberOrUndefined(value: unknown): number | undefined {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) && numeric >= 0 ? numeric : undefined;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : [];
}

function confidence(value: unknown, fallback = 75): number {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) : fallback;
}

function extractJson(text: string): unknown {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("Medi did not return a JSON curriculum structure.");
  return JSON.parse(candidate.slice(start, end + 1));
}

function normalizeModule(value: unknown): ExtractedModuleDraft | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const title = String(row.title ?? "").trim();
  if (!title) return null;
  return {
    tempId: uid(),
    title,
    code: String(row.code ?? "").trim() || undefined,
    description: String(row.description ?? "").trim(),
    estimatedHours: numberOrUndefined(row.estimatedHours ?? row.contactHours),
    learningOutcomes: strings(row.learningOutcomes),
    topics: strings(row.topics),
    confidence: confidence(row.confidence),
    decision: "create",
  };
}

function normalizeCourseUnit(value: unknown): ExtractedCourseUnitDraft | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const title = String(row.title ?? "").trim();
  if (!title) return null;
  const modules = Array.isArray(row.modules)
    ? row.modules.map(normalizeModule).filter((item): item is ExtractedModuleDraft => Boolean(item))
    : [];
  return {
    tempId: uid(),
    title,
    code: String(row.code ?? "").trim() || undefined,
    description: String(row.description ?? "").trim(),
    semester: numberOrUndefined(row.semester),
    yearOfStudy: numberOrUndefined(row.yearOfStudy),
    creditUnits: numberOrUndefined(row.creditUnits),
    contactHours: numberOrUndefined(row.contactHours),
    lectureHours: numberOrUndefined(row.lectureHours),
    tutorialHours: numberOrUndefined(row.tutorialHours),
    practicalHours: numberOrUndefined(row.practicalHours),
    clinicalHours: numberOrUndefined(row.clinicalHours),
    assessmentHours: numberOrUndefined(row.assessmentHours),
    prerequisites: strings(row.prerequisites),
    learningOutcomes: strings(row.learningOutcomes),
    modules,
    confidence: confidence(row.confidence),
    decision: "create",
  };
}

export async function analyseCurriculumWithAi(
  sourceFileName: string,
  sourceText: string
): Promise<CurriculumImportDraft> {
  const analysisStartedAt = performance.now();
  const clipped = sourceText.slice(0, MAX_CONTEXT_CHARS);
  const response = await generateAiResponse({
    mode: "curriculum_import",
    prompt: `Analyse the supplied health-professions curriculum and return ONLY valid JSON. Do not use markdown. Extract the programme and all course units/modules that are explicitly supported by the source. Use null when a value is unavailable. Confidence values must be integers from 0 to 100. Schema:\n{\n  "programme": {"title":"", "code":"", "award":"", "durationYears":null, "department":"", "description":"", "confidence":0},\n  "courseUnits": [{"title":"", "code":"", "description":"", "yearOfStudy":null, "semester":null, "creditUnits":null, "contactHours":null, "lectureHours":null, "tutorialHours":null, "practicalHours":null, "clinicalHours":null, "assessmentHours":null, "prerequisites":[], "learningOutcomes":[], "confidence":0, "modules":[{"title":"", "code":"", "description":"", "estimatedHours":null, "learningOutcomes":[], "topics":[], "confidence":0}]}],\n  "warnings":[]\n}\nDo not invent codes, hours, credits or outcomes. Preserve the curriculum wording where possible.`,
    context: `SOURCE FILE: ${sourceFileName}\n\n${clipped}`,
  });

  const parsed = extractJson(response.text) as Record<string, unknown>;
  const programmeRaw = (parsed.programme ?? {}) as Record<string, unknown>;
  const courseUnits = Array.isArray(parsed.courseUnits)
    ? parsed.courseUnits.map(normalizeCourseUnit).filter((item): item is ExtractedCourseUnitDraft => Boolean(item))
    : [];

  return {
    sourceFileName,
    sourceText,
    programme: {
      title: String(programmeRaw.title ?? "").trim(),
      code: String(programmeRaw.code ?? "").trim() || undefined,
      award: String(programmeRaw.award ?? "").trim() || undefined,
      durationYears: numberOrUndefined(programmeRaw.durationYears),
      department: String(programmeRaw.department ?? "").trim() || undefined,
      description: String(programmeRaw.description ?? "").trim() || undefined,
      confidence: confidence(programmeRaw.confidence),
      decision: "create",
    },
    courseUnits,
    analysisMethod: "ai",
    aiProvider: "OpenAI",
    analysisDurationMs: Math.round(performance.now() - analysisStartedAt),
    warnings: strings(parsed.warnings),
  };
}
