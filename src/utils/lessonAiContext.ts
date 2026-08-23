import type { Lesson } from "../models/Lesson";
import type { LessonBlock } from "../models/LessonBlock";

const SKIP_KEYS = new Set([
  "url", "filePath", "downloadUrl", "downloadURL", "previewPdfUrl", "previewPdfFilePath",
  "sourcePowerPointPath", "outputPath", "storagePath", "id", "ownerUserId", "createdByUid",
  "createdBy", "assignedTutorIds", "institutionId",
]);

function cleanText(value: string): string {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function collectStrings(value: unknown, key = "", depth = 0): string[] {
  if (depth > 6 || value == null || SKIP_KEYS.has(key)) return [];
  if (typeof value === "string") {
    const cleaned = cleanText(value);
    if (!cleaned || /^(https?:\/\/|gs:\/\/)/i.test(cleaned)) return [];
    return [cleaned];
  }
  if (typeof value === "number" || typeof value === "boolean") return [];
  if (Array.isArray(value)) return value.flatMap((item) => collectStrings(item, key, depth + 1));
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .flatMap(([childKey, child]) => collectStrings(child, childKey, depth + 1));
  }
  return [];
}

export function buildLessonBlockText(block: LessonBlock): string {
  const parts = [
    block.title,
    block.content,
    ...collectStrings(block.metadata ?? {}),
  ];
  return [...new Set(parts.flatMap((part) => collectStrings(part)))]
    .filter(Boolean)
    .join("\n");
}

export function buildLessonAiContext(lesson: Pick<Lesson,
  "title" | "description" | "learningObjectives" | "sections" | "blocks" | "references"
>): string {
  const parts: string[] = [];
  parts.push(`Lesson: ${lesson.title}`);
  if (lesson.description) parts.push(`Description: ${lesson.description}`);
  if (lesson.learningObjectives?.length) {
    parts.push(`Learning objectives:\n${lesson.learningObjectives.map((item) => item.objective).filter(Boolean).join("\n")}`);
  }
  if (lesson.sections?.length) {
    for (const section of lesson.sections) {
      const sectionText = collectStrings({
        title: section.title,
        content: section.content,
        clinicalPearl: section.clinicalPearl,
        caseScenario: section.caseScenario,
        slides: section.slides,
        knowledgeChecks: section.knowledgeChecks,
      }).join("\n");
      if (sectionText) parts.push(sectionText);
    }
  }
  for (const block of lesson.blocks ?? []) {
    const blockText = buildLessonBlockText(block);
    if (blockText) parts.push(blockText);
  }
  if (lesson.references?.length) parts.push(`References: ${lesson.references.join("; ")}`);

  return [...new Set(parts.map(cleanText).filter(Boolean))]
    .join("\n\n")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 44000);
}
