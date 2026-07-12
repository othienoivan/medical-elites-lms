import { Download, ExternalLink, FileText } from "lucide-react";

type Props = {
  originalUrl: string;
  previewPdfUrl?: string;
  title?: string;
  originalLabel?: string;
};

export default function DocumentViewer({
  originalUrl,
  previewPdfUrl,
  title,
  originalLabel = "Download original file",
}: Props) {
  const displayUrl = previewPdfUrl || originalUrl;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
            <FileText size={22} />
          </div>
          <div>
            <p className="font-bold text-slate-950">{title || "Lesson document"}</p>
            <p className="mt-1 text-sm text-slate-600">
              Use the PDF viewer controls to change pages, zoom, print, or open full screen.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href={displayUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-blue-400 hover:bg-blue-50"
          >
            <ExternalLink size={17} />
            Open preview
          </a>
          <a
            href={originalUrl}
            target="_blank"
            rel="noreferrer"
            download
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            <Download size={17} />
            {originalLabel}
          </a>
        </div>
      </div>

      <div className="h-[70vh] min-h-[520px] bg-slate-100 p-2 sm:p-4">
        <iframe
          src={displayUrl}
          title={title || "Lesson document preview"}
          className="h-full w-full rounded-xl border border-slate-200 bg-white"
        />
      </div>
    </div>
  );
}
