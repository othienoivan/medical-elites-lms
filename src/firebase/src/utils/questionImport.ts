import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

export type ImportedQuestionRow = Record<string, unknown>;

async function extractDocxText(file: File): Promise<string> {
  const { default: mammoth } = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
  return result.value.trim();
}

async function extractPdfText(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
  const pages: string[] = [];
  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    pages.push(content.items.map((item: unknown) => {
      if (typeof item === "object" && item !== null && "str" in item) {
        return String((item as { str?: unknown }).str ?? "");
      }
      return "";
    }).join(" "));
  }
  return pages.join("\n").trim();
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"') {
      if (quoted && text[index + 1] === '"') { field += '"'; index += 1; }
      else quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field); field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && text[index + 1] === "\n") index += 1;
      row.push(field); rows.push(row); row = []; field = "";
    } else field += character;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

function parseCsvRows(text: string): ImportedQuestionRow[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => header.trim());
  return rows.slice(1)
    .filter((row) => row.some((cell) => cell.trim()))
    .map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ""])));
}

function parseJsonRows(text: string): ImportedQuestionRow[] {
  const parsed: unknown = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error("JSON import must contain an array of question objects.");
  return parsed as ImportedQuestionRow[];
}

function cleanLine(line: string): string {
  return line.replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
}

/**
 * Parses common examination layouts:
 * 1. Question stem
 * A. Option
 * B. Option
 * Answer: B
 * Explanation: ...
 */
export function parseExamText(text: string): ImportedQuestionRow[] {
  const lines = text.split(/\r?\n/).map(cleanLine).filter(Boolean);
  const questions: ImportedQuestionRow[] = [];
  let current: {
    questionText: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    topic: string;
    marks: number;
  } | null = null;

  const flush = () => {
    if (!current || current.questionText.length < 5) return;
    const type = current.options.length >= 2 ? "mcq" : "short-answer";
    questions.push({
      questionText: current.questionText,
      topic: current.topic || "Imported examination",
      type,
      difficulty: "medium",
      bloomLevel: "apply",
      correctAnswer: current.correctAnswer || (type === "mcq" ? "" : "Marking guide required"),
      explanation: current.explanation,
      marks: current.marks || 1,
      options: current.options.join("|"),
      tags: "Imported exam",
      isPublished: "false",
    });
  };

  for (const line of lines) {
    const questionMatch = line.match(/^(?:question\s*)?(\d{1,3})[.)\-:]\s*(.+)$/i);
    const optionMatch = line.match(/^([A-H])[.)\-:]\s*(.+)$/i);
    const answerMatch = line.match(/^(?:correct\s*)?(?:answer|ans|key)\s*[:\-]\s*(.+)$/i);
    const explanationMatch = line.match(/^(?:explanation|rationale|feedback|marking\s*guide)\s*[:\-]\s*(.+)$/i);
    const marksMatch = line.match(/(?:\(|\[)?(\d+)\s*marks?(?:\)|\])?$/i);
    const sectionHeading = /^(section|part)\s+[a-z0-9]+\b/i.test(line);

    if (questionMatch && !sectionHeading) {
      flush();
      const stem = questionMatch[2].replace(/(?:\(|\[)?\d+\s*marks?(?:\)|\])?$/i, "").trim();
      current = {
        questionText: stem,
        options: [],
        correctAnswer: "",
        explanation: "",
        topic: "Imported examination",
        marks: marksMatch ? Number(marksMatch[1]) : 1,
      };
      continue;
    }

    if (!current) continue;
    if (optionMatch) {
      current.options.push(optionMatch[2]);
      continue;
    }
    if (answerMatch) {
      const answer = answerMatch[1].trim();
      const letter = answer.match(/^[A-H]\b/i)?.[0]?.toUpperCase();
      current.correctAnswer = letter && current.options.length
        ? `opt-${letter.charCodeAt(0) - 64}`
        : answer;
      continue;
    }
    if (explanationMatch) {
      current.explanation = explanationMatch[1].trim();
      continue;
    }
    if (!/^(instructions?|time|duration|date|name|registration)/i.test(line)) {
      if (current.options.length === 0 && !current.correctAnswer) current.questionText += ` ${line}`;
      else if (current.explanation) current.explanation += ` ${line}`;
    }
  }
  flush();
  return questions;
}

export async function extractQuestionRows(file: File): Promise<ImportedQuestionRow[]> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension === "json") return parseJsonRows(await file.text());
  if (extension === "csv") return parseCsvRows(await file.text());

  let text = "";
  if (extension === "txt") text = await file.text();
  else if (extension === "docx") text = await extractDocxText(file);
  else if (extension === "pdf") text = await extractPdfText(file);
  else throw new Error("Supported imports are PDF, DOCX, TXT, CSV and JSON.");

  const rows = parseExamText(text);
  if (rows.length === 0) {
    throw new Error("No numbered questions were detected. Use a layout such as '1. Question', followed by A-D options and 'Answer: B'.");
  }
  return rows;
}
