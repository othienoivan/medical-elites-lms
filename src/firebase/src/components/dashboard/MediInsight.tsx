import { ArrowRight, Sparkles } from "lucide-react";

export default function MediInsight({
  title = "Medi recommendation",
  message,
  actionLabel,
  onAction,
}: {
  title?: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-violet-700 to-purple-800 p-6 text-white shadow-lg">
      <div className="flex items-center gap-3">
        <span className="rounded-2xl bg-white/15 p-3"><Sparkles size={24} /></span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-100">Medical Elites AI</p>
          <h2 className="mt-1 text-xl font-bold">{title}</h2>
        </div>
      </div>
      <p className="mt-5 leading-7 text-indigo-50">{message}</p>
      <button
        type="button"
        onClick={onAction}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-indigo-700 transition hover:-translate-y-0.5 hover:bg-indigo-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
      >
        {actionLabel} <ArrowRight size={17} />
      </button>
    </div>
  );
}
