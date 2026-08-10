import { getDownloadURL, ref } from "firebase/storage";

import { storage } from "../config/firebase";

export type PowerPointHtmlFormat = "html-package" | "self-contained-html5";

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function createPowerPointHtmlConversionId(filePath: string): string {
  return bytesToBase64Url(new TextEncoder().encode(filePath));
}

export function getPowerPointHtmlOutputPath(
  sourcePath: string,
  format: PowerPointHtmlFormat,
): string {
  const conversionId = createPowerPointHtmlConversionId(sourcePath);
  const marker = "/powerpoints/";
  const markerIndex = sourcePath.indexOf(marker);
  if (markerIndex < 0) {
    throw new Error("PowerPoint conversion requires a file uploaded to the PowerPoint folder.");
  }
  const root = sourcePath.slice(0, markerIndex);
  const suffix = format === "html-package" ? "package" : "self-contained";
  return `${root}/html5/${conversionId}-${suffix}.html`;
}

export async function waitForPowerPointHtmlConversion({
  sourcePath,
  format,
  timeoutMs = 12 * 60 * 1000,
  pollMs = 4000,
}: {
  sourcePath: string;
  format: PowerPointHtmlFormat;
  timeoutMs?: number;
  pollMs?: number;
}): Promise<{ outputPath: string; downloadUrl: string }> {
  const outputPath = getPowerPointHtmlOutputPath(sourcePath, format);
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const downloadUrl = await getDownloadURL(ref(storage, outputPath));
      return { outputPath, downloadUrl };
    } catch {
      await new Promise((resolve) => window.setTimeout(resolve, pollMs));
    }
  }

  throw new Error(
    "PowerPoint conversion is taking longer than expected. Keep the lesson open and try Preview again shortly.",
  );
}
