import { Calendar, FileText, School, Timer } from "lucide-react";

import Card from "../ui/Card";
import Input from "../ui/Input";

type Props = {
  title: string;
  setTitle: (value: string) => void;

  examinationName: string;
  setExaminationName: (value: string) => void;

  institutionName: string;
  setInstitutionName: (value: string) => void;

  academicYear: string;
  setAcademicYear: (value: string) => void;

  semester: string;
  setSemester: (value: string) => void;

  timeAllowed: string;
  setTimeAllowed: (value: string) => void;

  candidateInstructions: string;
  setCandidateInstructions: (value: string) => void;
};

export default function ExaminationDetailsPanel({
  title,
  setTitle,
  examinationName,
  setExaminationName,
  institutionName,
  setInstitutionName,
  academicYear,
  setAcademicYear,
  semester,
  setSemester,
  timeAllowed,
  setTimeAllowed,
  candidateInstructions,
  setCandidateInstructions,
}: Props) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <FileText className="mt-1 text-blue-700" size={28} />

        <div>
          <h2 className="text-2xl font-bold text-slate-950">
            Examination Details
          </h2>

          <p className="mt-1 text-slate-600">
            Define the institutional identity, examination title, academic
            period, time allocation and candidate instructions.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Field label="Examination Title">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="General Pathology Final Examination"
          />
        </Field>

        <Field label="Examination Name">
          <Input
            value={examinationName}
            onChange={(event) => setExaminationName(event.target.value)}
            placeholder="FINAL EXAMINATION"
          />
        </Field>

        <Field label="Institution" icon={School}>
          <Input
            value={institutionName}
            onChange={(event) => setInstitutionName(event.target.value)}
            placeholder="Medical Elites Institute"
          />
        </Field>

        <Field label="Academic Year" icon={Calendar}>
          <Input
            value={academicYear}
            onChange={(event) => setAcademicYear(event.target.value)}
            placeholder="2026/2027"
          />
        </Field>

        <Field label="Semester">
          <Input
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
            placeholder="Semester II"
          />
        </Field>

        <Field label="Time Allowed" icon={Timer}>
          <Input
            value={timeAllowed}
            onChange={(event) => setTimeAllowed(event.target.value)}
            placeholder="3 Hours"
          />
        </Field>
      </div>

      <div className="mt-6">
        <Field label="Candidate Instructions">
          <textarea
            value={candidateInstructions}
            onChange={(event) => setCandidateInstructions(event.target.value)}
            className="min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
            placeholder={`Answer ALL questions.

Write your registration number clearly.

Begin each section on a new page.

Calculators are allowed where indicated.`}
          />
        </Field>
      </div>
    </Card>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700">
        {Icon && <Icon size={16} className="text-blue-700" />}
        {label}
      </label>

      {children}
    </div>
  );
}