import { Heart } from "lucide-react";

export default function CreatorAttribution() {
  return (
    <div className="border-t border-slate-800 bg-slate-950 px-4 py-3 text-center text-sm text-slate-300">
      <p className="inline-flex flex-wrap items-center justify-center gap-1.5">
        Made with <Heart size={15} className="fill-red-500 text-red-500" aria-label="love" /> from
        <strong className="font-semibold text-white">Othieno Ivan.</strong>
      </p>
    </div>
  );
}
