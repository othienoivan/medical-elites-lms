import { useEffect, useState, type FormEvent } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getAcademicYears, getInstitutionSettings, getSemesters, saveInstitutionSettings } from "../firebase/institutionCore";
import type { AcademicYear, InstitutionSettings, Semester } from "../models/InstitutionCore";

const initial: InstitutionSettings = { id: "primary", institutionName: "Medical Elites School of Health Sciences", motto: "Educate. Empower. Save Lives.", email: "", phone: "", address: "", website: "", currency: "UGX", timeZone: "Africa/Kampala", academicYearId: "", semesterId: "" };

export default function AdminSettingsPage() {
  const [form, setForm] = useState<InstitutionSettings>(initial);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [saving, setSaving] = useState(false);
  useEffect(() => { void (async () => { const [settings, yearRows, semesterRows] = await Promise.all([getInstitutionSettings(), getAcademicYears(), getSemesters()]); if (settings) setForm(settings); setYears(yearRows); setSemesters(semesterRows); })(); }, []);
  async function submit(event: FormEvent) { event.preventDefault(); setSaving(true); try { await saveInstitutionSettings(form); alert("Institution settings saved successfully."); } catch (error) { console.error(error); alert("Failed to save institution settings."); } finally { setSaving(false); } }
  const fields: Array<{ key: keyof InstitutionSettings; label: string; type?: string }> = [
    { key: "institutionName", label: "Institution Name" }, { key: "motto", label: "Motto" }, { key: "email", label: "Email", type: "email" }, { key: "phone", label: "Telephone" }, { key: "address", label: "Address" }, { key: "website", label: "Website", type: "url" }, { key: "currency", label: "Currency" }, { key: "timeZone", label: "Time Zone" },
  ];
  return <AdminLayout title="Institution Settings" subtitle="Configure the institution identity and current academic context."><form onSubmit={submit} className="max-w-4xl rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8"><div className="grid gap-5 md:grid-cols-2">{fields.map((field) => <label key={field.key} className="block"><span className="mb-2 block text-sm font-semibold text-slate-700">{field.label}</span><Input required={field.key === "institutionName"} type={field.type ?? "text"} value={String(form[field.key] ?? "")} onChange={(e) => setForm((current) => ({ ...current, [field.key]: e.target.value }))}/></label>)}<label><span className="mb-2 block text-sm font-semibold text-slate-700">Active Academic Year</span><select value={form.academicYearId} onChange={(e) => setForm((current) => ({ ...current, academicYearId: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="">Select academic year</option>{years.map((year) => <option key={year.id} value={year.id}>{year.name}</option>)}</select></label><label><span className="mb-2 block text-sm font-semibold text-slate-700">Active Semester</span><select value={form.semesterId} onChange={(e) => setForm((current) => ({ ...current, semesterId: e.target.value }))} className="w-full rounded-xl border border-slate-300 px-4 py-3"><option value="">Select semester</option>{semesters.filter((semester) => !form.academicYearId || semester.academicYearId === form.academicYearId).map((semester) => <option key={semester.id} value={semester.id}>{semester.name}</option>)}</select></label></div><div className="mt-7"><Button type="submit" loading={saving}>Save Institution Settings</Button></div></form></AdminLayout>;
}
