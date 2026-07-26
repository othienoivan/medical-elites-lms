import { ArrowLeft, Save, UserRoundPen } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import { getStudentById, updateStudentRecord } from "../firebase/students";
import useProgrammes from "../hooks/useProgrammes";
import useCourseUnits from "../hooks/useCourseUnits";
import { matchesAcademicPlacement, suggestedCourseUnitIds } from "../utils/academicPlacement";
import type { Student, StudentStatus } from "../models/Student";

type FormState = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  nationalId: string;
  registrationNumber: string;
  studentNumber: string;
  programmeId: string;
  academicYear: string;
  intake: string;
  yearOfStudy: string;
  semester: string;
  assignedCourseUnitIds: string[];
  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContact: string;
  sponsor: string;
  admissionDate: string;
  status: StudentStatus;
};

const emptyForm: FormState = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  nationalId: "",
  registrationNumber: "",
  studentNumber: "",
  programmeId: "",
  academicYear: "",
  intake: "",
  yearOfStudy: "",
  semester: "",
  assignedCourseUnitIds: [],
  email: "",
  phone: "",
  guardianName: "",
  guardianPhone: "",
  emergencyContact: "",
  sponsor: "",
  admissionDate: "",
  status: "active",
};

export default function EditStudentPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const { programmes, loading: programmesLoading } = useProgrammes();
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits(true);
  const [student, setStudent] = useState<Student | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assignmentNotice, setAssignmentNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadStudent() {
      if (!studentId) {
        if (active) {
          setError("Student identifier is missing.");
          setLoading(false);
        }
        return;
      }

      try {
        const record = await getStudentById(studentId);
        if (!active) return;

        if (!record) {
          setError("Student record was not found.");
          return;
        }

        setStudent(record);
        setForm({
          fullName: record.fullName || "",
          gender: record.gender || "",
          dateOfBirth: record.dateOfBirth || "",
          nationalId: record.nationalId || "",
          registrationNumber: record.registrationNumber || "",
          studentNumber: record.studentNumber || "",
          programmeId: record.programmeId || "",
          academicYear: record.academicYear || "",
          intake: record.intake || "",
          yearOfStudy: record.yearOfStudy || "",
          semester: record.semester || "",
          assignedCourseUnitIds: record.assignedCourseUnitIds || [],
          email: record.email || "",
          phone: record.phone || "",
          guardianName: record.guardianName || "",
          guardianPhone: record.guardianPhone || "",
          emergencyContact: record.emergencyContact || "",
          sponsor: record.sponsor || "",
          admissionDate: record.admissionDate || "",
          status: record.status || "active",
        });
      } catch (caughtError) {
        console.error("Failed to load student record:", caughtError);
        if (active) setError("Failed to load the student record.");
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadStudent();
    return () => {
      active = false;
    };
  }, [studentId]);

  const selectedProgramme = useMemo(
    () => programmes.find((programme) => programme.id === form.programmeId),
    [form.programmeId, programmes]
  );

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
  }


  function handleApplyAcademicUnits() {
    setAssignmentNotice(null);

    if (!form.programmeId) {
      setAssignmentNotice("Select a programme before applying course units.");
      return;
    }

    if (courseUnits.length === 0) {
      setAssignmentNotice("No course units are currently available to this tutor. Confirm that course units were created under this programme and redeploy the latest Firestore rules.");
      return;
    }

    const programmeUnits = courseUnits.filter((course) => course.programmeId === form.programmeId);
    if (programmeUnits.length === 0) {
      setAssignmentNotice("No course units are linked to the selected programme.");
      return;
    }

    const suggestedIds = suggestedCourseUnitIds(
      programmeUnits,
      form.programmeId,
      form.yearOfStudy,
      form.semester
    );

    if (suggestedIds.length === 0) {
      setAssignmentNotice(
        `No units match ${form.yearOfStudy || "the selected year"} and ${form.semester || "the selected semester"}. ${programmeUnits.length} programme unit${programmeUnits.length === 1 ? " is" : "s are"} available for manual selection.`
      );
      return;
    }

    updateField("assignedCourseUnitIds", suggestedIds);
    setAssignmentNotice(`${suggestedIds.length} course unit${suggestedIds.length === 1 ? "" : "s"} selected. Click Save Changes to store the assignment.`);
  }

  async function handleSave() {
    if (!studentId || !student) return;

    if (!form.fullName.trim() || !form.registrationNumber.trim() || !form.email.trim()) {
      alert("Full name, registration number and email are required.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateStudentRecord(studentId, {
        fullName: form.fullName.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        nationalId: form.nationalId.trim(),
        registrationNumber: form.registrationNumber.trim(),
        studentNumber: form.studentNumber.trim(),
        programmeId: form.programmeId,
        programmeTitle: selectedProgramme?.title || student.programmeTitle || "",
        academicYear: form.academicYear.trim(),
        intake: form.intake.trim(),
        yearOfStudy: form.yearOfStudy.trim(),
        semester: form.semester.trim(),
        assignedCourseUnitIds: form.assignedCourseUnitIds,
        email: form.email.trim(),
        phone: form.phone.trim(),
        guardianName: form.guardianName.trim(),
        guardianPhone: form.guardianPhone.trim(),
        emergencyContact: form.emergencyContact.trim(),
        sponsor: form.sponsor.trim(),
        admissionDate: form.admissionDate,
        status: form.status,
      });

      alert("Student profile updated successfully.");
      navigate(`/tutor/student-profile/${studentId}`);
    } catch (caughtError) {
      console.error("Failed to update student profile:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to update the student profile."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <TutorLayout
      title="Edit Student Profile"
      subtitle="Update learner biodata and academic placement without changing the linked authentication identity."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </Button>
        <Button loading={saving} onClick={() => void handleSave()}>
          <Save size={18} /> Save Changes
        </Button>
      </div>

      {error && <Card className="mb-6 border border-red-200 text-red-700">{error}</Card>}

      {loading || programmesLoading || courseUnitsLoading ? (
        <Card>Loading student profile...</Card>
      ) : !student ? (
        <Card className="text-center">
          <UserRoundPen className="mx-auto text-slate-400" size={48} />
          <h2 className="mt-4 text-xl font-bold text-slate-950">Student record unavailable</h2>
          <p className="mt-2 text-slate-600">Return to the directory and select another student.</p>
        </Card>
      ) : (
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-bold text-slate-950">Personal Details</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Full Name"><Input value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} /></Field>
              <Field label="Gender"><select className="w-full rounded-xl border border-slate-300 px-4 py-3" value={form.gender} onChange={(e) => updateField("gender", e.target.value)}><option value="">Select gender</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select></Field>
              <Field label="Date of Birth"><Input type="date" value={form.dateOfBirth} onChange={(e) => updateField("dateOfBirth", e.target.value)} /></Field>
              <Field label="National ID"><Input value={form.nationalId} onChange={(e) => updateField("nationalId", e.target.value)} /></Field>
              <Field label="Email"><Input type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} /></Field>
              <Field label="Phone"><Input value={form.phone} onChange={(e) => updateField("phone", e.target.value)} /></Field>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">Academic Details</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Registration Number"><Input value={form.registrationNumber} onChange={(e) => updateField("registrationNumber", e.target.value)} /></Field>
              <Field label="Student Number"><Input value={form.studentNumber} onChange={(e) => updateField("studentNumber", e.target.value)} /></Field>
              <Field label="Programme"><select className="w-full rounded-xl border border-slate-300 px-4 py-3" value={form.programmeId} onChange={(e) => updateField("programmeId", e.target.value)}><option value="">Select programme</option>{programmes.map((programme) => <option key={programme.id} value={programme.id}>{programme.title}</option>)}</select></Field>
              <Field label="Academic Year"><Input value={form.academicYear} onChange={(e) => updateField("academicYear", e.target.value)} placeholder="2026/2027" /></Field>
              <Field label="Intake"><Input value={form.intake} onChange={(e) => updateField("intake", e.target.value)} placeholder="July 2026" /></Field>
              <Field label="Year of Study"><Input value={form.yearOfStudy} onChange={(e) => updateField("yearOfStudy", e.target.value)} placeholder="Year 1" /></Field>
              <Field label="Semester"><Input value={form.semester} onChange={(e) => updateField("semester", e.target.value)} placeholder="Semester I" /></Field>
              <Field label="Admission Date"><Input type="date" value={form.admissionDate} onChange={(e) => updateField("admissionDate", e.target.value)} /></Field>
              <Field label="Status"><select className="w-full rounded-xl border border-slate-300 px-4 py-3" value={form.status} onChange={(e) => updateField("status", e.target.value as StudentStatus)}><option value="active">Active</option><option value="deferred">Deferred</option><option value="completed">Completed</option><option value="graduated">Graduated</option></select></Field>
            </div>

            <div className="mt-7 border-t border-slate-200 pt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-950">Assigned Course Units</h3>
                  <p className="text-sm text-slate-500">Only selected units will be available to this student.</p>
                </div>
                <Button type="button" variant="outline" onClick={handleApplyAcademicUnits}>
                  Apply Year/Semester Units
                </Button>
              </div>
              {assignmentNotice && (
                <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900">
                  {assignmentNotice}
                </div>
              )}
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {courseUnits.filter((course) => !form.programmeId || course.programmeId === form.programmeId).map((course) => {
                  const checked = form.assignedCourseUnitIds.includes(course.id);
                  const recommended = matchesAcademicPlacement(course, form.programmeId, form.yearOfStudy, form.semester);
                  return <label key={course.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 ${checked ? "border-blue-400 bg-blue-50" : "border-slate-200"}`}>
                    <input type="checkbox" className="mt-1" checked={checked} onChange={(event) => updateField("assignedCourseUnitIds", event.target.checked ? Array.from(new Set([...form.assignedCourseUnitIds, course.id])) : form.assignedCourseUnitIds.filter((id) => id !== course.id))} />
                    <span><span className="block font-semibold text-slate-900">{course.code ? `${course.code} — ` : ""}{course.title}</span><span className="text-xs text-slate-500">Year {course.yearOfStudy ?? "—"} · Semester {course.semester ?? "—"}{recommended ? " · Recommended" : ""}</span></span>
                  </label>;
                })}
                {courseUnits.filter((course) => !form.programmeId || course.programmeId === form.programmeId).length === 0 && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 md:col-span-2">
                    No course units are available for the selected programme. Create or correctly link course units before applying the academic placement.
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">Guardian and Sponsorship</h2>
            <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Guardian Name"><Input value={form.guardianName} onChange={(e) => updateField("guardianName", e.target.value)} /></Field>
              <Field label="Guardian Phone"><Input value={form.guardianPhone} onChange={(e) => updateField("guardianPhone", e.target.value)} /></Field>
              <Field label="Emergency Contact"><Input value={form.emergencyContact} onChange={(e) => updateField("emergencyContact", e.target.value)} /></Field>
              <Field label="Sponsor"><Input value={form.sponsor} onChange={(e) => updateField("sponsor", e.target.value)} /></Field>
            </div>
          </Card>

          <Card className="border border-blue-200 bg-blue-50 text-sm text-blue-950">
            The linked Firebase authentication UID is preserved automatically. Updating this profile will not disconnect the student login account or remove existing enrolments.
          </Card>
        </div>
      )}
    </TutorLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
