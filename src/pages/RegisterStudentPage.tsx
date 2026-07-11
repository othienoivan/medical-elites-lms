import {
  ArrowLeft,
  GraduationCap,
  Phone,
  Save,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import useProgrammes from "../hooks/useProgrammes";
import useStudents from "../hooks/useStudents";
import type { StudentStatus } from "../models/Student";

type StudentForm = {
  fullName: string;
  gender: string;
  dateOfBirth: string;
  academicYear: string;
  nationalId: string;

  registrationNumber: string;
  studentNumber: string;

  programmeId: string;
  programmeTitle: string;

  intake: string;
  yearOfStudy: string;
  semester: string;

  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContact: string;

  sponsor: string;
  admissionDate: string;
  status: StudentStatus;
};

const initialForm: StudentForm = {
  fullName: "",
  gender: "",
  dateOfBirth: "",
  academicYear: "",
  nationalId: "",

  registrationNumber: "",
  studentNumber: "",

  programmeId: "",
  programmeTitle: "",

  intake: "",
  yearOfStudy: "",
  semester: "",

  email: "",
  phone: "",
  guardianName: "",
  guardianPhone: "",
  emergencyContact: "",

  sponsor: "",
  admissionDate: "",
  status: "active",
};

export default function RegisterStudentPage() {
  const navigate = useNavigate();
  const { createStudent } = useStudents();
  const { programmes, loading: programmesLoading } = useProgrammes();

  const [form, setForm] = useState<StudentForm>(initialForm);
  const [saving, setSaving] = useState(false);

  function updateField<K extends keyof StudentForm>(
    field: K,
    value: StudentForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleProgrammeChange(programmeId: string) {
    const programme = programmes.find((item) => item.id === programmeId);

    setForm((current) => ({
      ...current,
      programmeId,
      programmeTitle: programme?.title ?? "",
    }));
  }

  function validateForm() {
    if (!form.fullName.trim()) {
      alert("Please enter the student's full name.");
      return false;
    }

    if (!form.registrationNumber.trim()) {
      alert("Please enter the registration number.");
      return false;
    }

    if (!form.programmeId) {
      alert("Please select a programme.");
      return false;
    }

    if (!form.academicYear.trim()) {
      alert("Please enter the academic year.");
      return false;
    }

    if (!form.email.trim()) {
      alert("Please enter the student's email.");
      return false;
    }

    return true;
  }

  async function handleSubmit() {
    if (!validateForm()) return;

    try {
      setSaving(true);

      await createStudent({
        fullName: form.fullName.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        academicYear: form.academicYear.trim(),
        nationalId: form.nationalId.trim(),

        registrationNumber: form.registrationNumber.trim(),
        studentNumber: form.studentNumber.trim(),

        programmeId: form.programmeId,
        programmeTitle: form.programmeTitle,

        intake: form.intake.trim(),
        yearOfStudy: form.yearOfStudy.trim(),
        semester: form.semester.trim(),

        email: form.email.trim(),
        phone: form.phone.trim(),
        guardianName: form.guardianName.trim(),
        guardianPhone: form.guardianPhone.trim(),
        emergencyContact: form.emergencyContact.trim(),

        sponsor: form.sponsor.trim(),
        admissionDate: form.admissionDate,
        status: form.status,
      });

      alert("Student registered successfully.");
      setForm(initialForm);
      navigate("/tutor/students");
    } catch (error) {
      console.error("Failed to register student:", error);
      alert(
        error instanceof Error
          ? `Failed to register student: ${error.message}`
          : "Failed to register student. Please check your connection and permissions."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <TutorLayout
      title="Register Student"
      subtitle="Create a new student academic record."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Student Registration</h2>

            <p className="mt-2 max-w-3xl text-blue-100">
              Capture personal, institutional, contact and academic details for
              a new learner.
            </p>
          </div>

          <Button
            className="bg-white text-blue-700 hover:bg-blue-50"
            onClick={() => navigate("/tutor/students")}
          >
            <ArrowLeft size={18} />
            Back to Directory
          </Button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <SectionTitle
              icon={User}
              title="Personal Information"
              subtitle="Basic biodata and identification details."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormField
                label="Full Name"
                value={form.fullName}
                onChange={(value) => updateField("fullName", value)}
                placeholder="Enter full name"
              />

              <SelectField
                label="Gender"
                value={form.gender}
                onChange={(value) => updateField("gender", value)}
                options={[
                  { value: "", label: "Select gender" },
                  { value: "male", label: "Male" },
                  { value: "female", label: "Female" },
                  { value: "other", label: "Other" },
                ]}
              />

              <FormField
                label="Date of Birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(value) => updateField("dateOfBirth", value)}
              />

              <FormField
                label="National ID / Passport"
                value={form.nationalId}
                onChange={(value) => updateField("nationalId", value)}
                placeholder="Enter NIN or passport number"
              />
            </div>
          </Card>

          <Card>
            <SectionTitle
              icon={GraduationCap}
              title="Institution Information"
              subtitle="Programme, student number and semester details."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormField
                label="Registration Number"
                value={form.registrationNumber}
                onChange={(value) => updateField("registrationNumber", value)}
                placeholder="ME-2026-001"
              />

              <FormField
                label="Student Number"
                value={form.studentNumber}
                onChange={(value) => updateField("studentNumber", value)}
                placeholder="STU001"
              />

              <div>
                <label
                  htmlFor="programme"
                  className="mb-2 block font-semibold text-slate-700"
                >
                  Programme
                </label>

                <select
                  id="programme"
                  value={form.programmeId}
                  onChange={(event) =>
                    handleProgrammeChange(event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                >
                  <option value="">
                    {programmesLoading
                      ? "Loading programmes..."
                      : "Select Programme"}
                  </option>

                  {programmes.map((programme) => (
                    <option key={programme.id} value={programme.id}>
                      {programme.title}
                    </option>
                  ))}
                </select>
              </div>

              <FormField
                label="Academic Year"
                value={form.academicYear}
                onChange={(value) => updateField("academicYear", value)}
                placeholder="2026/2027"
              />

              <FormField
                label="Intake"
                value={form.intake}
                onChange={(value) => updateField("intake", value)}
                placeholder="July 2026"
              />

              <FormField
                label="Year of Study"
                value={form.yearOfStudy}
                onChange={(value) => updateField("yearOfStudy", value)}
                placeholder="Year 1"
              />

              <FormField
                label="Semester"
                value={form.semester}
                onChange={(value) => updateField("semester", value)}
                placeholder="Semester I"
              />

              <FormField
                label="Admission Date"
                type="date"
                value={form.admissionDate}
                onChange={(value) => updateField("admissionDate", value)}
              />
            </div>
          </Card>

          <Card>
            <SectionTitle
              icon={Phone}
              title="Contact Information"
              subtitle="Student and guardian contact details."
            />

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <FormField
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => updateField("email", value)}
                placeholder="student@example.com"
              />

              <FormField
                label="Phone"
                value={form.phone}
                onChange={(value) => updateField("phone", value)}
                placeholder="+256..."
              />

              <FormField
                label="Guardian Name"
                value={form.guardianName}
                onChange={(value) => updateField("guardianName", value)}
                placeholder="Guardian full name"
              />

              <FormField
                label="Guardian Phone"
                value={form.guardianPhone}
                onChange={(value) => updateField("guardianPhone", value)}
                placeholder="+256..."
              />

              <FormField
                label="Emergency Contact"
                value={form.emergencyContact}
                onChange={(value) => updateField("emergencyContact", value)}
                placeholder="Emergency contact details"
              />

              <FormField
                label="Sponsor"
                value={form.sponsor}
                onChange={(value) => updateField("sponsor", value)}
                placeholder="Self / Government / Private"
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle
              icon={Shield}
              title="Academic Status"
              subtitle="Set the student's current academic state."
            />

            <div className="mt-6 space-y-5">
              <SelectField
                label="Student Status"
                value={form.status}
                onChange={(value) =>
                  updateField("status", value as StudentStatus)
                }
                options={[
                  { value: "active", label: "Active" },
                  { value: "deferred", label: "Deferred" },
                  { value: "completed", label: "Completed" },
                  { value: "graduated", label: "Graduated" },
                ]}
              />
            </div>
          </Card>

          <Card>
            <h2 className="text-xl font-bold text-slate-950">
              Registration Summary
            </h2>

            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <p>Name: {form.fullName || "Not set"}</p>
              <p>Registration No: {form.registrationNumber || "Not set"}</p>
              <p>Student No: {form.studentNumber || "Not set"}</p>
              <p>Programme: {form.programmeTitle || "Not set"}</p>
              <p>Academic Year: {form.academicYear || "Not set"}</p>
              <p>Semester: {form.semester || "Not set"}</p>
              <p>Email: {form.email || "Not set"}</p>
              <p>Status: {form.status}</p>
            </div>

            <div className="mt-6 grid gap-3">
              <Button disabled={saving} onClick={handleSubmit}>
                <Save size={18} />
                {saving ? "Saving..." : "Register Student"}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate("/tutor/students")}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </TutorLayout>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
        <Icon size={22} />
      </div>

      <div>
        <h2 className="text-xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const id = `field-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>

      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = `select-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>

      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
      >
        {options.map((option) => (
          <option key={option.value || option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}