import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";

type Status = "active" | "inactive" | "archived";
type BaseRecord = { id: string; name: string; startDate?: string; endDate?: string; academicYearId?: string; code?: string; description?: string; status: Status };
type Field = { name: keyof Omit<BaseRecord, "id">; label: string; type?: "text" | "date" | "select" | "textarea"; required?: boolean; options?: Array<{ value: string; label: string }> };
type Props<T extends BaseRecord> = { entityLabel: string; records: T[]; fields: Field[]; loading: boolean; onReload: () => Promise<void>; onCreate: (data: Omit<T, "id">) => Promise<unknown>; onUpdate: (id: string, data: Partial<Omit<T, "id">>) => Promise<unknown>; onDelete: (id: string) => Promise<unknown> };

function defaults(fields: Field[]): Omit<BaseRecord, "id"> {
  const values: Omit<BaseRecord, "id"> = { name: "", status: "active" };
  fields.forEach((field) => { if (field.name !== "name" && field.name !== "status") Object.assign(values, { [field.name]: "" }); });
  return values;
}

export default function InstitutionRecordManager<T extends BaseRecord>(props: Props<T>) {
  const { entityLabel, records, fields, loading, onReload, onCreate, onUpdate, onDelete } = props;
  const [form, setForm] = useState<Omit<BaseRecord, "id">>(() => defaults(fields));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { void onReload(); }, [onReload]);
  function reset() { setForm(defaults(fields)); setEditingId(null); }

  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true);
    try {
      if (editingId) await onUpdate(editingId, form as unknown as Partial<Omit<T, "id">>);
      else await onCreate(form as unknown as Omit<T, "id">);
      alert(`${entityLabel} ${editingId ? "updated" : "created"} successfully.`);
      reset(); await onReload();
    } catch (error) { console.error(error); alert(`Failed to save ${entityLabel.toLowerCase()}.`); }
    finally { setSaving(false); }
  }

  function edit(record: T) {
    const next = defaults(fields);
    fields.forEach((field) => Object.assign(next, { [field.name]: record[field.name] ?? "" }));
    setForm(next); setEditingId(record.id); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(record: T) {
    if (!confirm(`Delete ${record.name}? This action cannot be undone.`)) return;
    try { await onDelete(record.id); await onReload(); alert(`${entityLabel} deleted.`); }
    catch (error) { console.error(error); alert(`Failed to delete ${entityLabel.toLowerCase()}.`); }
  }

  return <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center gap-3"><span className="rounded-2xl bg-violet-100 p-3 text-violet-700"><Plus size={22}/></span><div><h2 className="text-xl font-bold text-slate-950">{editingId ? `Edit ${entityLabel}` : `Create ${entityLabel}`}</h2><p className="text-sm text-slate-500">Complete the institutional record below.</p></div></div>
      <div className="mt-6 space-y-4">{fields.map((field) => {
        const value = String(form[field.name] ?? "");
        return <label key={String(field.name)} className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</span>
          {field.type === "select" ? <select required={field.required} value={value} onChange={(e) => setForm((current) => ({ ...current, [field.name]: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200"><option value="">Select {field.label}</option>{field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.type === "textarea" ? <textarea required={field.required} value={value} onChange={(e) => setForm((current) => ({ ...current, [field.name]: e.target.value }))} className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200"/> : <Input required={field.required} type={field.type ?? "text"} value={value} onChange={(e) => setForm((current) => ({ ...current, [field.name]: e.target.value }))}/>} 
        </label>;
      })}</div>
      <div className="mt-6 flex flex-wrap gap-3"><Button type="submit" loading={saving}>{editingId ? "Save Changes" : `Create ${entityLabel}`}</Button>{editingId && <Button variant="outline" onClick={reset}>Cancel</Button>}</div>
    </form>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-bold text-slate-950">Configured {entityLabel}s</h2><p className="text-sm text-slate-500">{records.length} record{records.length === 1 ? "" : "s"}</p></div><Button size="sm" variant="outline" onClick={() => void onReload()}>Refresh</Button></div>
      {loading ? <div className="mt-6 space-y-3">{[1,2,3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100"/>)}</div> : records.length === 0 ? <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center"><p className="font-semibold text-slate-700">No {entityLabel.toLowerCase()} records yet.</p><p className="mt-1 text-sm text-slate-500">Use the form to create the first record.</p></div> : <div className="mt-6 space-y-3">{records.map((record) => <article key={record.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{record.name}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${record.status === "active" ? "bg-emerald-100 text-emerald-700" : record.status === "archived" ? "bg-slate-200 text-slate-700" : "bg-amber-100 text-amber-700"}`}>{record.status}</span></div><p className="mt-1 text-sm text-slate-500">{record.code || record.description || [record.startDate, record.endDate].filter(Boolean).join(" — ") || "Institution record"}</p></div><div className="flex gap-2"><button type="button" aria-label={`Edit ${record.name}`} onClick={() => edit(record)} className="rounded-xl border border-slate-200 p-2.5 text-slate-700 hover:bg-slate-50"><Pencil size={17}/></button><button type="button" aria-label={`Delete ${record.name}`} onClick={() => void remove(record)} className="rounded-xl border border-red-200 p-2.5 text-red-600 hover:bg-red-50"><Trash2 size={17}/></button></div></article>)}</div>}
    </section>
  </div>;
}
