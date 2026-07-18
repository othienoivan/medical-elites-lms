import { Download, FileText, Maximize2 } from "lucide-react";
import { useRef } from "react";

import Button from "../ui/Button";

type Props = {
  originalUrl: string;
  filePath?: string;
  title?: string;
  originalLabel?: string;
  manualPreviewPdfUrl?: string;
};

export default function OfficeDocumentViewer({
  originalUrl,
  title = "Office document",
  originalLabel = "Download Original",
  manualPreviewPdfUrl,
}: Props) {
  const frameRef = useRef<HTMLDivElement | null>(null);

  async function enterFullscreen() {
    await frameRef.current?.requestFullscreen?.();
  }

  if (manualPreviewPdfUrl) {
    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-red-100 p-2 text-red-700"><FileText size={22} /></div>
            <div>
              <p className="font-bold text-slate-950">{title}</p>
              <p className="mt-1 text-sm text-slate-600">PDF preview available for browser viewing.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => void enterFullscreen()}><Maximize2 size={17} /> Fullscreen</Button>
            <a href={originalUrl} target="_blank" rel="noreferrer" download className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"><Download size={17} /> {originalLabel}</a>
          </div>
        </div>
        <div ref={frameRef} className="h-[72vh] min-h-[520px] bg-slate-100 p-2 sm:p-4">
          <iframe src={manualPreviewPdfUrl} title={`${title} PDF preview`} className="h-full w-full rounded-xl border border-slate-200 bg-white" allowFullScreen />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
      <FileText className="mx-auto text-blue-700" size={44} />
      <h3 className="mt-4 text-xl font-bold text-slate-950">Browser preview not available</h3>
      <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">The tutor uploaded the original Office file without an optional PDF preview. Nothing will download automatically.</p>
      <a href={originalUrl} target="_blank" rel="noreferrer" download className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"><Download size={17} /> {originalLabel}</a>
    </div>
  );
}
