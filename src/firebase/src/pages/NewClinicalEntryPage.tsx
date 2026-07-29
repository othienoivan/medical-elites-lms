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
import type { PatientSex } from "../models/ClinicalLogbook";

const today = new Date().toISOString().slice(0, 10);

const categories = [
  "Patient Assessment",
  "Medical Procedure",
  "Surgical Procedure",
  "Maternal and Child Health",
  "Emergency Care",
  "Laboratory / Diagnostic",
  "Community Health",
  "Other",
];

export default function NewClinicalEntryPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { courseUnits } = useCourseUnits();
  const [student, setStudent] = useState<Student | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    courseUnitId: "",
    clinicalSite: "",
    department: "",
    supervisorName: "",
    procedureCategory: categories[0],
    procedureName: "",
    procedureDate: today,
    patientAgeGroup: "Adult",
    patientSex: "not-recorded" as PatientSex,
    indication: "",
    outcome: "",
    reflection: "",
  });

  useEffect(() => {
    if (!currentUser) return;
    void getStudentByAuthIdentity(currentUser.uid, currentUser.email).then(setStudent);
  }, [currentUser]);

  function update(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(status: "draft" | "submitted") {
    if (!currentUser || !student) {
      alert("Your student record could not be linked to this account.");
      return;
    }
    if (!form.clinicalSite.trim() || !form.procedureName.trim()) {
      alert("Clinical site and procedure name are required.");
      return;
    }

    const courseUnit = courseUnits.find((item) => item.id === form.courseUnitId);

    try {
      setSaving(true);
      await createClinicalEntry({
        studentId: student.id,
        studentAuthUid: currentUser.uid,
        studentName: student.fullName,
        registrationNumber: student.registrationNumber,
        programmeId: student.programmeId,
        programmeTitle: student.programmeTitle,
        courseUnitId: courseUnit?.id || "",
        courseUnitTitle: courseUnit?.title || "",
        clinicalSite: form.clinicalSite.trim(),
        department: form.department.trim(),
        supervisorName: form.supervisorName.trim(),
        procedureCategory: form.procedureCategory,
        procedureName: form.procedureName.trim(),
        procedureDate: form.procedureDate,
        patientAgeGroup: form.patientAgeGroup,
        patientSex: form.patientSex,
        indication: form.indication.trim(),
        outcome: form.outcome.trim(),
        reflection: form.reflection.trim(),
        status,
        tutorComment: "",
        reviewedByUid: "",
        reviewedByName: "",
      });
      alert(status === "submitted" ? "Clinical entry submitted for review." : "Draft saved successfully.");
      navigate("/clinical-logbook");
    } catch (error) {
      console.error("Failed to save clinical entry:", error);
      alert(error instanceof Error ? error.message : "Failed to save clinical entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Container className="py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">New Clinical Entry</h1>
            <p className="mt-2 text-slate-600">Do not record patient names, phone numbers, addresses, or hospital numbers.</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/clinical-logbook")}>
            <ArrowLeft size={18} /> Back
          </Button>
        </div>

        <Card>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Course Unit (optional)">
              <select value={form.courseUnitId} onChange={(e) => update("courseUnitId", e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700">
                <option value="">Select course unit</option>
                {courseUnits.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
              </select>
            </Field>
            <Field label="Procedure Date"><input type="date" value={form.procedureDate} onChange={(e) => update("procedureDate", e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700" /></Field>
            <Field label="Clinical Site"><input value={form.clinicalSite} onChange={(e) => update("clinicalSite", e.target.value)} placeholder="Hospital or health facility" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700" /></Field>
            <Field label="Ward / Department"><input value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="e.g. Medical ward" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700" /></Field>
            <Field label="Supervisor"><input value={form.supervisorName} onChange={(e) => update("supervisorName", e.target.value)} placeholder="Supervisor name" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700" /></Field>
            <Field label="Procedure Category">
              <select value={form.procedureCategory} onChange={(e) => update("procedureCategory", e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700">
                {categories.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>
            <Field label="Procedure / Encounter"><input value={form.procedureName} onChange={(e) => update("procedureName", e.target.value)} placeholder="e.g. IV cannulation" className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700" /></Field>
            <Field label="Patient Age Group">
              <select value={form.patientAgeGroup} onChange={(e) => update("patientAgeGroup", e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700">
                {['Neonate','Infant','Child','Adolescent','Adult','Older adult'].map((value) => <option key={value}>{value}</option>)}
              </select>
            </Field>
            <Field label="Patient Sex">
              <select value={form.patientSex} onChange={(e) => update("patientSex", e.target.value)} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700">
                <option value="not-recorded">Not recorded</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option>
              </select>
            </Field>
          </div>

          <div className="mt-5 grid gap-5">
            <TextArea label="Indication / Clinical Reason" value={form.indication} onChange={(value) => update("indication", value)} />
            <TextArea label="Outcome" value={form.outcome} onChange={(value) => update("outcome", value)} />
            <TextArea label="Reflection / Lessons Learned" value={form.reflection} onChange={(value) => update("reflection", value)} />
          </div>

          <div className="mt-8 flex flex-wrap justify-end gap-3">
            <Button variant="outline" disabled={saving} onClick={() => handleSubmit("draft")}><Save size={18} /> Save Draft</Button>
            <Button disabled={saving} onClick={() => handleSubmit("submitted")}><Save size={18} /> Submit for Verification</Button>
          </div>
        </Card>
      </Container>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-2 block font-semibold text-slate-700">{label}</span>{children}</label>;
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block font-semibold text-slate-700">{label}</span><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={4} className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 resize-y" /></label>;
}
