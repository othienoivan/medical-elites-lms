import { Download, FileWarning } from "lucide-react";
import Button from "../ui/Button";

type Props = {
  url: string;
  title?: string;
};

export default function PowerPointViewer({ url, title }: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 p-4">
        <p className="font-bold text-slate-950">{title || "PowerPoint presentation"}</p>
      </div>
      <div className="p-6 text-center">
        <FileWarning className="mx-auto text-amber-600" size={40} />
        <h3 className="mt-4 text-lg font-bold text-slate-950">Browser preview not available</h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          Attach a PDF preview to display these slides inside Medical Elites. The original PowerPoint is available only when the learner deliberately downloads it.
        </p>
        <a href={url} target="_blank" rel="noreferrer" download className="mt-5 inline-block">
          <Button><Download size={17} /> Download PowerPoint</Button>
        </a>
      </div>
    </div>
  );
}
