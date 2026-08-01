import { useMemo, useState, type FormEvent } from "react";
import { Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import PlatformLayout from "./PlatformLayout";
import PlatformCard from "./PlatformCard";
import EmptyPlatformState from "./EmptyPlatformState";

export type PlatformFormField = {
  key: string;
  label: string;
  type?: "text" | "number" | "select" | "textarea" | "checkbox";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string | number | boolean;
};

export default function PlatformCollectionPage<T extends { id: string }>({
  title, subtitle, records, loading, error, fields, createLabel, emptyMessage,
  getTitle, getSubtitle, getBadge, onCreate, onRemove, onRefresh,
}: {
  title: string;
  subtitle: string;
  records: T[];
  loading: boolean;
  error: string | null;
  fields: PlatformFormField[];
  createLabel: string;
  emptyMessage: string;
  getTitle: (record: T) => string;
  getSubtitle: (record: T) => string;
  getBadge?: (record: T) => string;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onRemove?: (record: T) => Promise<void>;
  onRefresh: () => Promise<void>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const filtered = useMemo(() => records.filter((record) => `${getTitle(record)} ${getSubtitle(record)}`.toLowerCase().includes(search.toLowerCase())), [records, search, getTitle, getSubtitle]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setFormError(null);
    const data = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const field of fields) {
      if (field.type === "checkbox") payload[field.key] = data.get(field.key) === "on";
      else if (field.type === "number") payload[field.key] = Number(data.get(field.key) || 0);
      else payload[field.key] = String(data.get(field.key) ?? "").trim();
    }
    try { await onCreate(payload); event.currentTarget.reset(); setShowForm(false); await onRefresh(); }
    catch (caught) { setFormError(caught instanceof Error ? caught.message : "Unable to save the record."); }
    finally { setSaving(false); }
  }
  return <PlatformLayout title={title} subtitle={subtitle} actions={<button onClick={() => setShowForm((value) => !value)} className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-cyan-700"><Plus size={18}/>{createLabel}</button>}>
    {showForm && <PlatformCard title={createLabel} description="Create a platform record without changing academic LMS collections." className="mb-6"><form onSubmit={(event) => void submit(event)} className="grid gap-4 md:grid-cols-2">{fields.map((field) => <label key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}><span className="mb-1 block text-sm font-bold text-slate-700">{field.label}</span>{field.type === "select" ? <select name={field.key} required={field.required} defaultValue={String(field.defaultValue ?? "")} className="w-full rounded-xl border border-slate-300 px-3 py-2.5"><option value="">Select...</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "textarea" ? <textarea name={field.key} required={field.required} placeholder={field.placeholder} className="min-h-28 w-full rounded-xl border border-slate-300 px-3 py-2.5"/> : field.type === "checkbox" ? <input name={field.key} type="checkbox" defaultChecked={Boolean(field.defaultValue)} className="h-5 w-5 rounded border-slate-300"/> : <input name={field.key} type={field.type ?? "text"} required={field.required} placeholder={field.placeholder} defaultValue={String(field.defaultValue ?? "")} className="w-full rounded-xl border border-slate-300 px-3 py-2.5"/>}</label>)}{formError && <p className="md:col-span-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{formError}</p>}<div className="md:col-span-2 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border px-4 py-2.5 font-bold text-slate-700">Cancel</button><button disabled={saving} className="rounded-xl bg-slate-950 px-5 py-2.5 font-bold text-white disabled:opacity-50">{saving ? "Saving..." : "Save"}</button></div></form></PlatformCard>}
    <PlatformCard title="Records" description={`${records.length} total`} action={<button onClick={() => void onRefresh()} className="rounded-xl border p-2 text-slate-600 hover:bg-slate-50" aria-label="Refresh"><RefreshCw size={18}/></button>}>
      <div className="relative mb-4"><Search className="absolute left-3 top-3 text-slate-400" size={18}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search records" className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-3"/></div>
      {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}
      {loading ? <p className="py-8 text-center text-slate-500">Loading...</p> : filtered.length === 0 ? <EmptyPlatformState message={emptyMessage}/> : <div className="divide-y rounded-2xl border">{filtered.map((record) => <div key={record.id} className="flex items-center justify-between gap-4 p-4"><div className="min-w-0"><p className="truncate font-bold text-slate-950">{getTitle(record)}</p><p className="mt-1 truncate text-sm text-slate-500">{getSubtitle(record)}</p></div><div className="flex items-center gap-2">{getBadge && <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black capitalize text-slate-700">{getBadge(record).replaceAll("_", " ")}</span>}{onRemove && <button aria-label="Delete record" onClick={() => void onRemove(record).then(onRefresh)} className="rounded-lg p-2 text-red-600 hover:bg-red-50"><Trash2 size={17}/></button>}</div></div>)}</div>}
    </PlatformCard>
  </PlatformLayout>;
}
