import { Archive, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getDepartments } from "../firebase/institutionCore";
import { createProgramme, deleteProgramme, getAllProgrammes, updateProgramme } from "../firebase/programmes";
import useAuth from "../hooks/useAuth";
import type { Department } from "../models/InstitutionCore";
import type { Programme, ProgrammeLevel } from "../models/Programme";

const levels: ProgrammeLevel[] = ["Certificate", "Diploma", "Higher Diploma", "Degree", "Postgraduate Diploma", "Master's", "PhD", "CPD"];
const blank = { title: "", code: "", level: "Diploma" as ProgrammeLevel, department: "", duration: "", description: "", published: true };

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default function AdminProgrammesPage() {
  const { currentUser } = useAuth();
  const [records, setRecords] = useState<Programme[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const [programmeRows, departmentRows] = await Promise.all([getAllProgrammes(), getDepartments()]);
      setRecords(programmeRows);
      setDepartments(departmentRows.filter((item) => item.status !== "archived"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void reload();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [reload]);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return records.filter((item) => [item.title, item.code, item.department, item.level].some((value) => String(value ?? "").toLowerCase().includes(keyword)));
  }, [records, search]);

  function reset() { setForm(blank); setEditingId(null); }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!currentUser) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateProgramme(editingId, { ...form, slug: slugify(form.title) });
        alert("Programme updated successfully.");
      } else {
        await createProgramme({ id: "", ...form, slug: slugify(form.title), faculty: "", createdBy: currentUser.uid, createdAt: new Date(), updatedAt: new Date() });
        alert("Programme created successfully.");
      }
      reset();
      await reload();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Failed to save programme.");
    } finally {
      setSaving(false);
    }
  }

  function edit(item: Programme) {
    setEditingId(item.id);
    setForm({ title: item.title, code: item.code ?? "", level: item.level, department: item.department ?? "", duration: item.duration, description: item.description, published: item.published });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function remove(item: Programme) {
    const confirmation = window.prompt(`Delete ${item.title}?\n\nType DELETE to confirm.`);
    if (confirmation !== "DELETE") return;
    try {
      await deleteProgramme(item.id);
      alert("Programme deleted successfully.");
      await reload();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete programme.");
    }
  }

  async function archive(item: Programme) {
    await updateProgramme(item.id, { published: false });
    await reload();
    alert("Programme archived.");
  }

  return <AdminLayout title="Programmes" subtitle="Create, edit, archive and safely delete academic programmes.">
    <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.4fr)]">
      <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3"><span className="rounded-2xl bg-violet-100 p-3 text-violet-700"><Plus size={21}/></span><div><h2 className="text-xl font-bold text-slate-950">{editingId ? "Edit Programme" : "Create Programme"}</h2><p className="text-sm text-slate-500">Define the programme and its academic ownership.</p></div></div>
        <div className="mt-6 space-y-4">
          <Field label="Programme Title"><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Programme Code"><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}/></Field>
            <Field label="Level"><select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value as ProgrammeLevel })} className="w-full rounded-xl border border-slate-300 px-4 py-3">{levels.map((level) => <option key={level}>{level}</option>)}</select></Field>
          </div>
          <Field label="Department"><select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="">Select Department</option>{departments.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></Field>
          <Field label="Duration"><Input required value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} placeholder="3 Years"/></Field>
          <Field label="Description"><textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3"/></Field>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700"><input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })}/> Active / Published</label>
        </div>
        <div className="mt-6 flex gap-3"><Button type="submit" loading={saving}>{editingId ? "Save Changes" : "Create Programme"}</Button>{editingId && <Button type="button" variant="outline" onClick={reset}>Cancel</Button>}</div>
      </form>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-bold text-slate-950">Configured Programmes</h2><p className="text-sm text-slate-500">{records.length} total programme records</p></div><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search programmes..."/></div>
        {loading ? <p className="mt-6 text-slate-500">Loading programmes…</p> : <div className="mt-6 space-y-3">{filtered.map((item) => <article key={item.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h3 className="font-bold text-slate-950">{item.title}</h3><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${item.published ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>{item.published ? "active" : "archived"}</span></div><p className="mt-1 text-sm text-slate-500">{item.code || "No code"} · {item.level} · {item.duration}{item.department ? ` · ${item.department}` : ""}</p></div><div className="flex gap-2"><IconButton label="Edit" onClick={() => edit(item)}><Pencil size={17}/></IconButton>{item.published && <IconButton label="Archive" onClick={() => void archive(item)}><Archive size={17}/></IconButton>}<IconButton label="Delete" danger onClick={() => void remove(item)}><Trash2 size={17}/></IconButton></div></div></article>)}</div>}
      </section>
    </div>
  </AdminLayout>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>{children}</label>; }
function IconButton({ label, children, onClick, danger = false }: { label: string; children: React.ReactNode; onClick: () => void; danger?: boolean }) { return <button type="button" aria-label={label} onClick={onClick} className={`rounded-xl border p-2.5 ${danger ? "border-red-200 text-red-600 hover:bg-red-50" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}>{children}</button>; }
