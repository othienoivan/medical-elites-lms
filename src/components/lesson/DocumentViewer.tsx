import { Download, ExternalLink, FileText, Maximize2 } from "lucide-react";
import { useMemo, useRef } from "react";

type Props = { originalUrl: string; previewPdfUrl?: string; title?: string; originalLabel?: string; contentType?: string };

function extension(url: string) {
  const clean = decodeURIComponent(url.split("?")[0]).toLowerCase();
  return clean.match(/\.([a-z0-9]+)$/)?.[1] ?? "";
}

export default function DocumentViewer({ originalUrl, previewPdfUrl, title, originalLabel = "Download original file", contentType }: Props) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const ext = extension(originalUrl);
  const isWord = contentType?.includes("word") || ["doc", "docx"].includes(ext);
  const displayUrl = useMemo(() => {
    if (previewPdfUrl) return previewPdfUrl;
    if (isWord) return `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(originalUrl)}`;
    return originalUrl;
  }, [isWord, originalUrl, previewPdfUrl]);

  async function enterFullscreen() { await frameRef.current?.requestFullscreen?.(); }

  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3"><div className="rounded-xl bg-blue-100 p-2 text-blue-700"><FileText size={22}/></div><div>
        <p className="font-bold text-slate-950">{title || "Lesson document"}</p>
        <p className="mt-1 text-sm text-slate-600">Previewed inside Medical Elites. Files download only when you select Download.</p>
      </div></div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => void enterFullscreen()} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50"><Maximize2 size={17}/> Fullscreen</button>
        <a href={displayUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-blue-50"><ExternalLink size={17}/> Open viewer</a>
        <a href={originalUrl} download className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"><Download size={17}/>{originalLabel}</a>
      </div>
    </div>
    <div ref={frameRef} className="h-[72vh] min-h-[520px] bg-slate-100 p-2 sm:p-4">
      <iframe src={displayUrl} title={title || "Lesson document preview"} className="h-full w-full rounded-xl border border-slate-200 bg-white" allowFullScreen/>
    </div>
  </div>;
}
