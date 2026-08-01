import {
  Calendar,
  Download,
  FileText,
  GraduationCap,
  Printer,
  Trophy,
  User,
} from "lucide-react";
import { useMemo, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useTutorQuizAttempts from "../hooks/useTutorQuizAttempts";
import useStudents from "../hooks/useStudents";

type TranscriptRow = {
  courseUnit: string;
  assessment: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: string;
  submitted: string;
};

export default function StudentTranscriptPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const transcriptRef = useRef<HTMLDivElement | null>(null);

  const { attempts, loading } = useTutorQuizAttempts();
  const { students, loading: studentsLoading } = useStudents();

  const student = useMemo(() => {
    return students.find((item) => item.id === studentId);
  }, [students, studentId]);

  const attemptStudentId = student?.authUid || studentId;

  const studentAttempts = useMemo(() => {
    return attempts
      .filter((attempt) => attempt.studentId === attemptStudentId)
      .sort((a, b) => {
        const aTime = normalizeDate(a.submittedAt)?.getTime() || 0;
        const bTime = normalizeDate(b.submittedAt)?.getTime() || 0;

        return aTime - bTime;
      });
  }, [attempts, attemptStudentId]);

  const studentName =
    student?.fullName || studentAttempts[0]?.studentName || "Student";

  const rows = useMemo<TranscriptRow[]>(() => {
    return studentAttempts.map((attempt) => {
      const percentage = attempt.finalPercentage ?? attempt.percentage;
      const score = attempt.finalScore ?? attempt.score;

      return {
        courseUnit: attempt.courseUnitTitle || "Not Assigned",
        assessment: attempt.quizTitle,
        score,
        totalMarks: attempt.totalMarks,
        percentage,
        grade: getGrade(percentage),
        status: percentage >= 50 ? "PASS" : "FAIL",
        submitted: formatDate(attempt.submittedAt),
      };
    });
  }, [studentAttempts]);

  const average =
    rows.length > 0
      ? Math.round(
          rows.reduce((sum, row) => sum + row.percentage, 0) / rows.length
        )
      : 0;

  const finalGrade = getGrade(average);
  const finalStatus = average >= 50 ? "GOOD STANDING" : "ACADEMIC SUPPORT";

  if (loading || studentsLoading) {
    return (
      <TutorLayout
        title="Student Transcript"
        subtitle="Loading academic transcript."
      >
        <Card>Loading transcript...</Card>
      </TutorLayout>
    );
  }

  if (!student && studentAttempts.length === 0) {
    return (
      <TutorLayout
        title="Student Transcript"
        subtitle="No academic records found."
      >
        <Card className="text-center">
          <GraduationCap size={52} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No transcript records found
          </h2>

          <p className="mt-2 text-slate-600">
            This student has no registered profile or completed assessments yet.
          </p>

          <Button
            className="mt-6"
            variant="outline"
            onClick={() => navigate("/tutor/students")}
          >
            Back to Student Directory
          </Button>
        </Card>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout
      title="Student Transcript"
      subtitle="Generate and print a student academic transcript."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Academic Transcript</h2>
            <p className="mt-2 text-blue-100">{studentName}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/tutor/students")}
            >
              Back to Directory
            </Button>

            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => window.print()}
            >
              <Printer size={18} />
              Print
            </Button>

            <Button
  className="bg-white text-blue-700 hover:bg-blue-50"
  onClick={() => window.print()}
>
  <Download size={18} />
  Download PDF
</Button>
          </div>
        </div>
      </section>

      <div ref={transcriptRef}>
        <Card>
          <div className="border-b border-slate-200 pb-6 text-center">
            <h1 className="text-3xl font-bold uppercase text-blue-700">
              Medical Elites LMS
            </h1>

            <p className="mt-2 text-sm font-semibold uppercase text-slate-500">
              Official Academic Transcript
            </p>
          </div>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <InfoBox icon={User} label="Student" value={studentName} />

            <InfoBox
              icon={FileText}
              label="Registration No."
              value={student?.registrationNumber || "N/A"}
            />

            <InfoBox
              icon={FileText}
              label="Student No."
              value={student?.studentNumber || "N/A"}
            />

            <InfoBox
              icon={GraduationCap}
              label="Programme"
              value={student?.programmeTitle || "N/A"}
            />

            <InfoBox
              icon={Calendar}
              label="Academic Year"
              value={student?.academicYear || "N/A"}
            />

            <InfoBox
              icon={Calendar}
              label="Year / Semester"
              value={`${student?.yearOfStudy || "N/A"} / ${
                student?.semester || "N/A"
              }`}
            />

            <InfoBox
              icon={Calendar}
              label="Intake"
              value={student?.intake || "N/A"}
            />

            <InfoBox
              icon={Calendar}
              label="Generated"
              value={new Date().toLocaleString()}
            />
          </section>

          <section className="mt-8 grid gap-4 md:grid-cols-4">
            <MetricBox
              icon={FileText}
              label="Assessments"
              value={rows.length}
            />

            <MetricBox icon={Trophy} label="Average" value={`${average}%`} />

            <MetricBox
              icon={GraduationCap}
              label="Final Grade"
              value={finalGrade}
            />

            <MetricBox
              icon={FileText}
              label="Academic Status"
              value={finalStatus}
            />
          </section>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-slate-950">
              Assessment Record
            </h2>

            {rows.length === 0 ? (
              <p className="mt-4 text-slate-600">
                No completed assessment records yet.
              </p>
            ) : (
              <div className="mt-5 overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="p-3">Course Unit</th>
                      <th className="p-3">Assessment</th>
                      <th className="p-3">Submitted</th>
                      <th className="p-3">Score</th>
                      <th className="p-3">Percentage</th>
                      <th className="p-3">Grade</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {rows.map((row) => (
                      <tr
                        key={`${row.assessment}-${row.submitted}`}
                        className="border-b"
                      >
                        <td className="p-3 text-slate-700">
                          {row.courseUnit}
                        </td>

                        <td className="p-3 font-semibold text-slate-950">
                          {row.assessment}
                        </td>

                        <td className="p-3">{row.submitted}</td>

                        <td className="p-3">
                          {row.score}/{row.totalMarks}
                        </td>

                        <td className="p-3 font-bold text-blue-700">
                          {row.percentage}%
                        </td>

                        <td className="p-3">{row.grade}</td>

                        <td className="p-3 font-semibold">{row.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="mt-8 grid gap-6 border-t border-slate-200 pt-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Registrar / Tutor Signature
              </p>

              <div className="mt-8 border-t border-slate-400 pt-2 text-sm text-slate-500">
                Signature / Stamp
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-500">
                Verification
              </p>

              <div className="mt-4 rounded-xl border border-dashed border-slate-300 p-4 text-center text-sm text-slate-500">
                Digitally generated academic record
              </div>
            </div>
          </section>
        </Card>
      </div>
    </TutorLayout>
  );
}

function normalizeDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatDate(value: unknown) {
  const date = normalizeDate(value);
  return date ? date.toLocaleString() : "-";
}

function getGrade(percentage: number) {
  if (percentage >= 90) return "A";
  if (percentage >= 80) return "B+";
  if (percentage >= 70) return "B";
  if (percentage >= 60) return "C+";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

function InfoBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
      <Icon size={20} className="mt-0.5 text-blue-700" />

      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-1 font-bold text-slate-950">{value}</p>
      </div>
    </div>
  );
}

function MetricBox({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <Icon size={24} className="text-blue-700" />

      <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}