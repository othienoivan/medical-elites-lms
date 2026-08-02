import type { LucideIcon } from "lucide-react";
export default function PlatformMetric({ label, value, helper, icon: Icon }: { label: string; value: string | number; helper?: string; icon: LucideIcon }) {
  return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div className="rounded-2xl bg-cyan-50 p-3 text-cyan-700"><Icon size={21}/></div></div><p className="mt-4 text-sm font-bold text-slate-500">{label}</p><p className="mt-1 text-3xl font-black text-slate-950">{value}</p>{helper && <p className="mt-2 text-xs text-slate-500">{helper}</p>}</div>;
}
