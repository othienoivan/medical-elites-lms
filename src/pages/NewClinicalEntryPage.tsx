import { ArrowLeft, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import { createClinicalEntry } from "../firebase/clinicalLogbook";
import { getStudentByAuthIdentity } from "../firebase/students";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import type { Student } from "../models/Student";
import type { ClinicalEncounterType, ParticipationLevel, PatientSex } from "../models/ClinicalLogbook";

const today = new Date().toISOString().slice(0, 10);
const categories = ["Patient Assessment","Medical Procedure","Surgical Procedure","Maternal and Child Health","Emergency Care","Laboratory / Diagnostic","Community Health","Other"];

export default function NewClinicalEntryPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courseUnits } = useCourseUnits();
  const [student, setStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    courseUnitId: "", clinicalSite: "", department: "", rotationName: "", supervisorName: "", supervisorRole: "",
    encounterType: "procedure" as ClinicalEncounterType, participationLevel: "performed-supervised" as ParticipationLevel,
    clinicalHours: "1", procedureCategory: categories[0], procedureName: "", procedureDate: today,
    patientAgeGroup: "Adult", patientSex: "not-recorded" as PatientSex, indication: "", outcome: "",
    learningOutcomes: "", reflection: "", evidenceLinks: "",
  });

  useEffect(() => { if (currentUser) void getStudentByAuthIdentity(currentUser.uid, currentUser.email).then(setStudent); }, [currentUser]);
  function update(field: keyof typeof form, value: string) { setForm((current) => ({ ...current, [field]: value })); }

  async function handleSubmit(status: "draft" | "submitted") {
    if (!currentUser || !student) return alert("Your student record could not be linked to this account.");
    if (!form.clinicalSite.trim() || !form.procedureName.trim()) return alert("Clinical site and procedure/encounter name are required.");
    const hours = Number(form.clinicalHours);
    if (!Number.isFinite(hours) || hours <= 0 || hours > 24) return alert("Clinical hours must be greater than 0 and not exceed 24 for one entry.");
    const courseUnit = courseUnits.find((item) => item.id === form.courseUnitId);
    try {
      setSaving(true);
      await createClinicalEntry({
        studentId: student.id, studentAuthUid: currentUser.uid, studentName: student.fullName,
        registrationNumber: student.registrationNumber, programmeId: student.programmeId, programmeTitle: student.programmeTitle,
        courseUnitId: courseUnit?.id || "", courseUnitTitle: courseUnit?.title || "", clinicalSite: form.clinicalSite.trim(),
        department: form.department.trim(), rotationName: form.rotationName.trim(), supervisorName: form.supervisorName.trim(),
        supervisorRole: form.supervisorRole.trim(), encounterType: form.encounterType, participationLevel: form.participationLevel,
        clinicalHours: hours, procedureCategory: form.procedureCategory, procedureName: form.procedureName.trim(),
        procedureDate: form.procedureDate, patientAgeGroup: form.patientAgeGroup, patientSex: form.patientSex,
        indication: form.indication.trim(), outcome: form.outcome.trim(),
        learningOutcomes: form.learningOutcomes.split("\n").map(v => v.trim()).filter(Boolean), reflection: form.reflection.trim(),
        evidenceLinks: form.evidenceLinks.split("\n").map(v => v.trim()).filter(Boolean), status,
        tutorComment: "", competencyLevel: "not-assessed", communicationScore: 0, clinicalReasoningScore: 0,
        professionalismScore: 0, proceduralSkillScore: 0, reviewedByUid: "", reviewedByName: "",
      });
      alert(status === "submitted" ? "Clinical entry submitted for review." : "Draft saved successfully.");
      navigate("/clinical-logbook");
    } catch (error) { console.error(error); alert(error instanceof Error ? error.message : "Failed to save clinical entry."); }
    finally { setSaving(false); }
  }

  return <main className="min-h-screen bg-slate-100"><Container className="py-10">
    <div className="mb-6 flex items-center justify-between"><div><h1 className="text-3xl font-bold text-slate-950">New Clinical Entry</h1><p className="mt-2 text-slate-600">Never record patient names, contacts, addresses, hospital numbers, faces or other identifiers.</p></div><Button variant="outline" onClick={() => navigate("/clinical-logbook")}><ArrowLeft size={18}/> Back</Button></div>
    <Card><div className="grid gap-5 md:grid-cols-2">
      <Field label="Course Unit"><select value={form.courseUnitId} onChange={e=>update("courseUnitId",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"><option value="">Select course unit</option>{courseUnits.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select></Field>
      <Field label="Procedure Date"><input type="date" value={form.procedureDate} onChange={e=>update("procedureDate",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"/></Field>
      <Field label="Clinical Site"><input value={form.clinicalSite} onChange={e=>update("clinicalSite",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700" placeholder="Hospital or health facility"/></Field>
      <Field label="Ward / Department"><input value={form.department} onChange={e=>update("department",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"/></Field>
      <Field label="Rotation / Placement"><input value={form.rotationName} onChange={e=>update("rotationName",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700" placeholder="e.g. Internal Medicine"/></Field>
      <Field label="Clinical Hours"><input type="number" min="0.5" max="24" step="0.5" value={form.clinicalHours} onChange={e=>update("clinicalHours",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"/></Field>
      <Field label="Supervisor"><input value={form.supervisorName} onChange={e=>update("supervisorName",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"/></Field>
      <Field label="Supervisor Role"><input value={form.supervisorRole} onChange={e=>update("supervisorRole",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700" placeholder="e.g. Clinical Officer"/></Field>
      <Field label="Encounter Type"><select value={form.encounterType} onChange={e=>update("encounterType",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"><option value="case">Patient case</option><option value="procedure">Procedure</option><option value="ward-round">Ward round</option><option value="community">Community activity</option><option value="simulation">Simulation</option></select></Field>
      <Field label="Participation Level"><select value={form.participationLevel} onChange={e=>update("participationLevel",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"><option value="observed">Observed</option><option value="assisted">Assisted</option><option value="performed-supervised">Performed under supervision</option><option value="performed-independently">Performed independently</option></select></Field>
      <Field label="Category"><select value={form.procedureCategory} onChange={e=>update("procedureCategory",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700">{categories.map(c=><option key={c}>{c}</option>)}</select></Field>
      <Field label="Procedure / Encounter"><input value={form.procedureName} onChange={e=>update("procedureName",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"/></Field>
      <Field label="Patient Age Group"><select value={form.patientAgeGroup} onChange={e=>update("patientAgeGroup",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700">{["Neonate","Infant","Child","Adolescent","Adult","Older adult"].map(v=><option key={v}>{v}</option>)}</select></Field>
      <Field label="Patient Sex"><select value={form.patientSex} onChange={e=>update("patientSex",e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"><option value="not-recorded">Not recorded</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select></Field>
    </div><div className="mt-5 grid gap-5"><TextArea label="Indication / Clinical Reason" value={form.indication} onChange={v=>update("indication",v)}/><TextArea label="Outcome" value={form.outcome} onChange={v=>update("outcome",v)}/><TextArea label="Learning Outcomes Demonstrated (one per line)" value={form.learningOutcomes} onChange={v=>update("learningOutcomes",v)}/><TextArea label="Reflection / Lessons Learned" value={form.reflection} onChange={v=>update("reflection",v)}/><TextArea label="Anonymized Evidence Links (optional, one per line)" value={form.evidenceLinks} onChange={v=>update("evidenceLinks",v)}/></div>
    <div className="mt-8 flex justify-end gap-3"><Button variant="outline" disabled={saving} onClick={()=>handleSubmit("draft")}><Save size={18}/> Save Draft</Button><Button disabled={saving} onClick={()=>handleSubmit("submitted")}><Save size={18}/> Submit for Verification</Button></div>
    </Card></Container></main>;
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="block"><span className="mb-2 block font-semibold text-slate-700">{label}</span>{children}</label>}
function TextArea({label,value,onChange}:{label:string;value:string;onChange:(v:string)=>void}){return <label><span className="mb-2 block font-semibold text-slate-700">{label}</span><textarea rows={4} value={value} onChange={e=>onChange(e.target.value)} className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"/></label>}
