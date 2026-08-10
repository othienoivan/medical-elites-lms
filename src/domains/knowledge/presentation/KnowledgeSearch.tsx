import { Search } from "lucide-react";
import type { FormEvent } from "react";

export default function KnowledgeSearch({ value, onChange, onSubmit, placeholder = "How can we help?" }: { value: string; onChange: (value: string) => void; onSubmit?: () => void; placeholder?: string }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit?.();
  }
  return <form onSubmit={submit} className="relative"><Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={22} /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-base shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100" /></form>;
}
