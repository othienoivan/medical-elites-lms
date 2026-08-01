import type { ReactNode } from "react";
export default function PlatformCard({ title, description, children, action, className = "" }: { title: string; description?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}><div className="flex items-start justify-between gap-4"><div><h2 className="text-lg font-black text-slate-950">{title}</h2>{description && <p className="mt-1 text-sm text-slate-500">{description}</p>}</div>{action}</div><div className="mt-5">{children}</div></section>;
}
