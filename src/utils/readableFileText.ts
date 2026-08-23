import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

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
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export async function extractReadableTextFromFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();
  let text = "";

  if (extension === "pdf" || file.type === "application/pdf") {
    text = await extractPdfText(file);
  } else if (extension === "docx" || file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    text = await extractDocxText(file);
  } else if (["txt", "csv", "md"].includes(extension || "") || file.type.startsWith("text/plain")) {
    text = await file.text();
  } else if (["html", "htm"].includes(extension || "") || file.type === "text/html") {
    text = stripHtml(await file.text());
  }

  return text.replace(/\s+/g, " ").trim().slice(0, 44000);
}
