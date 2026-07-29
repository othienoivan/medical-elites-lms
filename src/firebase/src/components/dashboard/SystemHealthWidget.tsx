import { CheckCircle2, Cloud, Database, ShieldCheck, Sparkles, Wifi } from "lucide-react";

const services = [
  { label: "Authentication", icon: ShieldCheck },
  { label: "Firestore", icon: Database },
  { label: "Cloud Functions", icon: Cloud },
  { label: "Medi AI", icon: Sparkles },
  { label: "Application", icon: Wifi },
];

export default function SystemHealthWidget() {
  return (
    <div className="space-y-3">
      {services.map(({ label, icon: Icon }) => (
        <div
          key={label}
          className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-white p-2 text-slate-700 shadow-sm">
              <Icon size={18} />
            </span>
            <span className="font-semibold text-slate-800">{label}</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700">
            <CheckCircle2 size={17} /> Online
          </span>
        </div>
      ))}
    </div>
  );
}
