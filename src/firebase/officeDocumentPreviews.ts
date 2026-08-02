import { doc, onSnapshot, type Unsubscribe } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";

import { db, storage } from "../config/firebase";

export type OfficePreviewStatus = "queued" | "processing" | "ready" | "error";

export type OfficeDocumentPreview = {
  id: string;
  sourcePath: string;
  sourceName?: string;
  sourceSize?: number;
  status: OfficePreviewStatus;
  previewPdfPath?: string;
  previewPdfUrl?: string;
  errorMessage?: string;
};

export function createOfficePreviewId(filePath: string): string {
  const bytes = new TextEncoder().encode(filePath);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

export function watchOfficeDocumentPreview(
  filePath: string,
  onChange: (preview: OfficeDocumentPreview | null) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const previewId = createOfficePreviewId(filePath);
  return onSnapshot(
    doc(db, "officeDocumentPreviews", previewId),
    (snapshot) => {
      if (!snapshot.exists()) {
        onChange(null);
        return;
      }
      onChange({ id: snapshot.id, ...(snapshot.data() as Omit<OfficeDocumentPreview, "id">) });
    },
    (error) => onError?.(error)
  );
}

export async function resolvePreviewPdfUrl(preview: OfficeDocumentPreview): Promise<string> {
  if (preview.previewPdfUrl) return preview.previewPdfUrl;
  if (!preview.previewPdfPath) throw new Error("The converted PDF path is not available yet.");
  return getDownloadURL(ref(storage, preview.previewPdfPath));
}
