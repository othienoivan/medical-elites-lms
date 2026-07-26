import { Archive, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import useAccessScope from "../hooks/useAccessScope";
import AdminLayout from "../components/layout/AdminLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getAllCourseUnits } from "../firebase/courseUnits";
import { createModule, deleteModule, getAllModules, updateModule } from "../firebase/modules";
import { getAllProgrammes } from "../firebase/programmes";
import type { CourseUnit } from "../models/CourseUnit";
import type { Module } from "../models/Module";
import type { Programme } from "../models/Programme";

const blank = { programmeId: "", courseUnitId: "", title: "", code: "", description: "", order: 1, estimatedHours: 4, passMark: 80, published: true };

export default function AdminModulesPage() {
  const accessScope = useAccessScope();
  const [records, setRecords] = useState<Module[]>([]);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const reload = useCallback(async () => { setLoading(true); try { const [moduleRows, programmeRows, courseRows] = await Promise.all([getAllModules(accessScope!), getAllProgrammes(accessScope!), getAllCourseUnits(accessScope!)]); setRecords(moduleRows); setProgrammes(programmeRows); setCourseUnits(courseRows); } finally { setLoading(false); } }, [accessScope]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [reload]);
  const filteredCourseUnits = courseUnits.filter((item) => item.programmeId === form.programmeId);
  const selectedProgramme = programmes.find((item) => item.id === form.programmeId);
  const selectedCourseUnit = courseUnits.find((item) => item.id === form.courseUnitId);
  const filtered = useMemo(() => { const keyword = search.toLowerCase(); return records.filter((item) => [item.title, item.code, item.courseUnitTitle].some((value) => String(value ?? "").toLowerCase().includes(keyword))); }, [records, search]);
  function reset() { setForm(blank); setEditingId(null); }

  async function submit(event: FormEvent) { event.preventDefault(); if (!selectedProgramme || !selectedCourseUnit) return; setSaving(true); try { const payload = { programmeId: selectedProgramme.id, programmeTitle: selectedProgramme.title, courseUnitId: selectedCourseUnit.id, courseUnitTitle: selectedCourseUnit.title, title: form.title, code: form.code, description: form.description, order: form.order, estimatedHours: form.estimatedHours, passMark: form.passMark, duration: `${form.estimatedHours} Hours`, published: form.published, updatedAt: new Date() }; if (editingId) await updateModule(editingId, payload); else await createModule({ id: "", ...payload, lessons: 0, createdAt: new Date() }); alert(`Module ${editingId ? "updated" : "created"} successfully.`); reset(); await reload(); } catch (error) { alert(error instanceof Error ? error.message : "Failed to save module."); } finally { setSaving(false); } }
  function edit(item: Module) { setEditingId(item.id); setForm({ programmeId: item.programmeId ?? "", courseUnitId: item.courseUnitId ?? item.courseId ?? "", title: item.title, code: item.code ?? "", description: item.description, order: item.order, estimatedHours: item.estimatedHours ?? 4, passMark: item.passMark, published: item.published }); window.scrollTo({ top: 0, behavior: "smooth" }); }
  async function remove(item: Module) { if (window.prompt(`Delete ${item.title}? Type DELETE to confirm.`) !== "DELETE") return; await deleteModule(item.id); await reload(); alert("Module deleted."); }
  async function archive(item: Module) { await updateModule(item.id, { published: false }); await reload(); alert("Module archived."); }

  return <AdminLayout title="Modules" subtitle="Manage the ordered learning modules under each course unit."><div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><span className="rounded-2xl bg-violet-100 p-3 text-violet-700"><Plus size={21}/></span><div><h2 className="text-xl font-bold">{editingId ? "Edit Module" : "Create Module"}</h2><p className="text-sm text-slate-500">Place the module within a programme and course unit.</p></div></div><div className="mt-6 space-y-4">
      <Field label="Programme"><select required value={form.programmeId} onChange={(e) => setForm({ ...form, programmeId: e.target.value, courseUnitId: "" })} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="">Select Programme</option>{programmes.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></Field>
      <Field label="Course Unit"><select required disabled={!form.programmeId} value={form.courseUnitId} onChange={(e) => setForm({ ...form, courseUnitId: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3 disabled:bg-slate-100"><option value="">Select Course Unit</option>{filteredCourseUnits.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></Field>
      <Field label="Module Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/></Field>
      <div className="grid gap-4 sm:grid-cols-2"><Field label="Code"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}/></Field><NumberField label="Order" value={form.order} onChange={(value) => setForm({ ...form, order: value })}/></div>
      <div className="grid gap-4 sm:grid-cols-2"><NumberField label="Estimated Hours" value={form.estimatedHours} onChange={(value) => setForm({ ...form, estimatedHours: value })}/><NumberField label="Pass Mark (%)" value={form.passMark} onChange={(value) => setForm({ ...form, passMark: value })}/></div>
      <Field label="Description"><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"/></Field>
      <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })}/> Published</label>
    </div><div className="mt-6 flex gap-3"><Button type="submit" loading={saving}>{editingId ? "Save Changes" : "Create Module"}</Button>{editingId && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div></form>
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold">Configured Modules</h2><p className="text-sm text-slate-500">{records.length} records</p></div><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search modules..."/></div>{loading ? <p className="mt-6 text-slate-500">Loading…</p> : <div className="mt-6 space-y-3">{filtered.map((item) => <article key={item.id} className="rounded-2xl border p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex items-center gap-2"><h3 className="font-bold">{item.order}. {item.title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>{item.published ? "published" : "archived"}</span></div><p className="mt-1 text-sm text-slate-500">{item.courseUnitTitle || "Unlinked course unit"} · Pass mark {item.passMark}%</p></div><div className="flex gap-2"><IconButton label="Edit" onClick={() => edit(item)}><Pencil size={17}/></IconButton>{item.published && <IconButton label="Archive" onClick={() => void archive(item)}><Archive size={17}/></IconButton>}<IconButton label="Delete" danger onClick={() => void remove(item)}><Trash2 size={17}/></IconButton></div></div></article>)}</div>}</section>
  </div></AdminLayout>;
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>; }
function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) { return <Field label={label}><Input type="number" min="1" value={value} onChange={(e) => onChange(Number(e.target.value))}/></Field>; }
function IconButton({ label, children, onClick, danger = false }: { label: string; children: React.ReactNode; onClick: () => void; danger?: boolean }) { return <button type="button" aria-label={label} onClick={onClick} className={`rounded-xl border p-2.5 ${danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{children}</button>; }
