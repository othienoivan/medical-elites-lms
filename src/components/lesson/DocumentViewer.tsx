import { Download, FileText } from "lucide-react";

import Button from "../ui/Button";

type Props = {
  originalUrl: string;
  previewPdfUrl?: string;
  title?: string;
  originalLabel?: string;
  contentType?: string;
};

async function downloadFile(url: string, fileName: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Unable to download this file.");
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

/** Download-only attachment card. PDF browser previews are intentionally disabled. */
export default function DocumentViewer({
  originalUrl,
  title = "PDF document",
  originalLabel = "Download PDF",
}: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
      <FileText className="mx-auto text-red-600" size={44} />
      <h3 className="mt-4 text-xl font-bold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm text-slate-600">PDF document • Download only</p>
      <Button
        className="mt-5"
        onClick={() => void downloadFile(originalUrl, title).catch((error) => {
          console.error("PDF download failed:", error);
          window.alert(error instanceof Error ? error.message : "Unable to download this file.");
        })}
      >
        <Download size={17} /> {originalLabel}
      </Button>
    </div>
  );
}
