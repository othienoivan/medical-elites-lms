import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

type WordNumberingDefinition = {
  format: string;
  template: string;
  start: number;
};

function wordAttribute(element: Element | null, name: string) {
  return element?.getAttribute(`w:${name}`) || element?.getAttribute(name) || "";
}

function alphabeticLabel(value: number, upper: boolean) {
  let number = Math.max(1, value);
  let label = "";
  while (number > 0) {
    number -= 1;
    label = String.fromCharCode((upper ? 65 : 97) + (number % 26)) + label;
    number = Math.floor(number / 26);
  }
  return label;
}

function romanLabel(value: number, upper: boolean) {
  const symbols: Array<[number, string]> = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"],
    [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"],
    [5, "V"], [4, "IV"], [1, "I"],
  ];
  let number = Math.max(1, value);
  let result = "";
  for (const [amount, symbol] of symbols) {
    while (number >= amount) {
      result += symbol;
      number -= amount;
    }
  }
  return upper ? result : result.toLowerCase();
}

function formatWordListNumber(value: number, format: string) {
  if (format === "upperLetter") return alphabeticLabel(value, true);
  if (format === "lowerLetter") return alphabeticLabel(value, false);
  if (format === "upperRoman") return romanLabel(value, true);
  if (format === "lowerRoman") return romanLabel(value, false);
  return String(value);
}

async function extractDocxText(file: File): Promise<string> {
  const { default: JSZip } = await import("jszip");
  const archive = await JSZip.loadAsync(await file.arrayBuffer());
  const documentXml = await archive.file("word/document.xml")?.async("text");
  const numberingXml = await archive.file("word/numbering.xml")?.async("text");
  if (!documentXml) return "";

  const parser = new DOMParser();
  const numbering = new Map<string, WordNumberingDefinition>();

  if (numberingXml) {
    const numberingDocument = parser.parseFromString(numberingXml, "application/xml");
    const abstracts = new Map<string, Element>();
    Array.from(numberingDocument.getElementsByTagName("w:abstractNum")).forEach((item) => {
      abstracts.set(wordAttribute(item, "abstractNumId"), item);
    });

    Array.from(numberingDocument.getElementsByTagName("w:num")).forEach((item) => {
      const numId = wordAttribute(item, "numId");
      const abstractId = wordAttribute(item.getElementsByTagName("w:abstractNumId")[0] || null, "val");
      const abstract = abstracts.get(abstractId);
      const level = Array.from(abstract?.getElementsByTagName("w:lvl") || [])
        .find((candidate) => wordAttribute(candidate, "ilvl") === "0");
      if (!numId || !level) return;
      const override = Array.from(item.getElementsByTagName("w:lvlOverride"))
        .find((candidate) => wordAttribute(candidate, "ilvl") === "0");
      const startOverride = override?.getElementsByTagName("w:startOverride")[0];
      const startElement = level.getElementsByTagName("w:start")[0];
      numbering.set(numId, {
        format: wordAttribute(level.getElementsByTagName("w:numFmt")[0], "val") || "decimal",
        template: wordAttribute(level.getElementsByTagName("w:lvlText")[0], "val") || "%1.",
        start: Number(wordAttribute(startOverride || startElement, "val") || "1"),
      });
    });
  }

  const document = parser.parseFromString(documentXml, "application/xml");
  const counters = new Map<string, number>();
  const lines: string[] = [];

  Array.from(document.getElementsByTagName("w:p")).forEach((paragraph) => {
    const text = Array.from(paragraph.getElementsByTagName("w:t"))
      .map((node) => node.textContent || "")
      .join("")
      .trim();
    if (!text) return;

    const numIdElement = paragraph.getElementsByTagName("w:numId")[0];
    const numId = wordAttribute(numIdElement || null, "val");
    const definition = numbering.get(numId);
    if (!definition) {
      lines.push(text);
      return;
    }

    const value = counters.get(numId) ?? definition.start;
    counters.set(numId, value + 1);
    const label = definition.template.replace(/%1/g, formatWordListNumber(value, definition.format));
    lines.push(`${label} ${text}`);
  });

  return lines.join("\n").trim();
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

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&");
}

async function extractPptxText(file: File): Promise<string> {
  const { default: JSZip } = await import("jszip");
  const archive = await JSZip.loadAsync(await file.arrayBuffer());
  const slidePaths = Object.keys(archive.files)
    .filter((path) => /^ppt\/slides\/slide\d+\.xml$/i.test(path))
    .sort((a, b) => Number(a.match(/slide(\d+)/i)?.[1] ?? 0) - Number(b.match(/slide(\d+)/i)?.[1] ?? 0));
  const slides = await Promise.all(slidePaths.map(async (path) => {
    const xml = await archive.file(path)?.async("text") ?? "";
    return [...xml.matchAll(/<a:t>([\s\S]*?)<\/a:t>/g)]
      .map((match) => decodeXml(match[1]))
      .join(" ");
  }));
  return slides.join("\n").trim();
}

function stripHtml(value: string) {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function normalizeExtractedText(value: string) {
  return value
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean)
    .join("\n")
    .trim()
    .slice(0, 44000);
}

export async function extractReadableTextFromFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let text = "";

  if (extension === "pdf" || file.type === "application/pdf") {
    text = await extractPdfText(file);
  } else if (extension === "docx" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    text = await extractDocxText(file);
  } else if (extension === "pptx" || file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
    text = await extractPptxText(file);
  } else if (["txt", "csv", "md"].includes(extension || "") || file.type.startsWith("text/plain")) {
    text = await file.text();
  } else if (["html", "htm"].includes(extension || "") || file.type === "text/html") {
    text = stripHtml(await file.text());
  }

  return normalizeExtractedText(text);
}
