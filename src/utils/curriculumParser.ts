import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import type { CurriculumImportDraft, ExtractedCourseUnitDraft } from "../models/CurriculumImport";

const uid = () => crypto.randomUUID();
const clean = (value: string) => value.replace(/\s+/g, " ").trim();

async function extractDocxText(file: File): Promise<string> {
  const { default: mammoth } = await import("mammoth");
  const result = await mammoth.extractRawText({
    arrayBuffer: await file.arrayBuffer(),
  });

  return result.value.trim();
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

  const pdf = await pdfjsLib.getDocument({
    data: new Uint8Array(await file.arrayBuffer()),
  }).promise;

  const pages: string[] = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();

    pages.push(
      content.items
        .map((item: unknown) => {
          if (typeof item === "object" && item !== null && "str" in item) {
            return String((item as { str?: unknown }).str ?? "");
          }

          return "";
        })
        .join(" ")
    );
  }

  return pages.join("\n").trim();
}

export async function extractCurriculumText(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "txt") {
    return (await file.text()).trim();
  }

  if (extension === "docx") {
    return extractDocxText(file);
  }

  if (extension === "pdf") {
    return extractPdfText(file);
  }

  throw new Error("Only PDF, DOCX and TXT curriculum files are supported.");
}

function probableCourseUnit(line: string): boolean {
  return /^(course\s*unit|unit|subject)\b/i.test(line) || /^[A-Z]{2,8}\s?\d{3,5}\b/.test(line);
}

function probableModule(line: string): boolean {
  return /^(module|topic|chapter|section)\s*\d*[.:\-)]?/i.test(line);
}

export function parseCurriculumHeuristically(sourceFileName: string, sourceText: string): CurriculumImportDraft {
  const lines = sourceText.split(/\r?\n/).map(clean).filter((line) => line.length > 2);
  const courseUnits: ExtractedCourseUnitDraft[] = [];
  let current: ExtractedCourseUnitDraft | null = null;

  for (const line of lines) {
    if (probableCourseUnit(line)) {
      const code = line.match(/\b[A-Z]{2,8}\s?\d{3,5}\b/)?.[0]?.replace(/\s+/g, "");
      const title = clean(line.replace(/^(course\s*unit|unit|subject)\s*\d*[.:\-)]?/i, "").replace(code ?? "", "").replace(/^[:\-–—]+/, ""));

      if (title.length >= 3) {
        current = { tempId: uid(), title, code, description: "", modules: [], confidence: 55, decision: "create" };
        courseUnits.push(current);
      }

      continue;
    }

    if (current && probableModule(line)) {
      const code = line.match(/\b[A-Z]{2,8}\s?\d{2,5}(?:\.\d+)?\b/)?.[0]?.replace(/\s+/g, "");
      const title = clean(line.replace(/^(module|topic|chapter|section)\s*\d*[.:\-)]?/i, "").replace(code ?? "", "").replace(/^[:\-–—]+/, ""));

      if (title.length >= 3) {
        current.modules.push({ tempId: uid(), title, code, description: "", confidence: 50, decision: "create" });
      }

      continue;
    }

    if (current && !current.description && line.length > 30) {
      current.description = line.slice(0, 500);
    }
  }

  if (courseUnits.length === 0) {
    lines
      .filter((line) => line.length < 100 && !/[.!?]$/.test(line))
      .slice(0, 12)
      .forEach((title) => {
        courseUnits.push({ tempId: uid(), title, description: "", modules: [], confidence: 35, decision: "create" });
      });
  }

  return {
    sourceFileName,
    sourceText,
    programme: { title: sourceFileName.replace(/\.(pdf|docx|txt)$/i, ""), confidence: 35, decision: "create" },
    courseUnits,
    analysisMethod: "heuristic",
    warnings: ["AI analysis was unavailable. Review all heuristically detected fields carefully."],
  };
}
