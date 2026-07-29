import type { ElementType } from "react";

const tones = {
  blue: "bg-blue-100 text-blue-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  purple: "bg-violet-100 text-violet-700",
  teal: "bg-teal-100 text-teal-700",
  rose: "bg-rose-100 text-rose-700",
};

export type StatTone = keyof typeof tones;

export default function StatWidget({
  title,
  value,
  helper,
  icon: Icon,
  tone = "blue",
}: {
  title: string;
  value: string | number;
  helper?: string;
  icon: ElementType;
  tone?: StatTone;
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
          {helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}
        </div>
        <div className={`rounded-2xl p-3 ${tones[tone]}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}
