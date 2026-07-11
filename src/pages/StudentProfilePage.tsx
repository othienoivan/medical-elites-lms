import {
  BarChart3,
  CheckCircle,
  Download,
  FileText,
  GraduationCap,
  Mail,
  Printer,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useTutorQuizAttempts from "../hooks/useTutorQuizAttempts";
import useStudents from "../hooks/useStudents";

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const navigate = useNavigate();

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

        return bTime - aTime;
      });
  }, [attempts, attemptStudentId]);

  const studentName =
    student?.fullName || studentAttempts[0]?.studentName || "Student";

  const percentages = studentAttempts.map(
    (attempt) => attempt.finalPercentage ?? attempt.percentage
  );

  const completedAssessments = studentAttempts.length;

  const average =
    percentages.length > 0
      ? Math.round(
          percentages.reduce((sum, value) => sum + value, 0) /
            percentages.length
        )
      : 0;

  const highest = percentages.length > 0 ? Math.max(...percentages) : 0;
  const lowest = percentages.length > 0 ? Math.min(...percentages) : 0;
  const passed = percentages.filter((value) => value >= 50).length;
  const failed = completedAssessments - passed;

  const passRate =
    completedAssessments > 0
      ? Math.round((passed / completedAssessments) * 100)
      : 0;

  const currentGrade = getGrade(average);
  const academicStatus = average >= 50 ? "Good Standing" : "Academic Support";

  if (loading || studentsLoading) {
    return (
      <TutorLayout
        title="Student Profile"
        subtitle="Loading student academic profile."
      >
        <Card>Loading student profile...</Card>
      </TutorLayout>
    );
  }

  if (!student && studentAttempts.length === 0) {
    return (
      <TutorLayout
        title="Student Profile"
        subtitle="No student academic record found."
      >
        <Card className="text-center">
          <User size={52} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No student profile data found
          </h2>

          <p className="mt-2 text-slate-600">
            This student has no registered profile or completed assessment
            attempts yet.
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
      title="Student Profile"
      subtitle="360° academic profile and learner performance record."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-blue-700">
              <User size={42} />
            </div>

            <div>
              <h2 className="text-3xl font-bold">{studentName}</h2>

              <p className="mt-2 text-blue-100">
                Registration No: {student?.registrationNumber || "N/A"}
              </p>

              <p className="mt-1 text-blue-100">
                Status: {student?.status || academicStatus}
              </p>
            </div>
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
              onClick={() =>
                navigate(`/tutor/student-transcript/${studentId}`)
              }
            >
              <Download size={18} />
              Transcript
            </Button>

            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => window.print()}
            >
              <Printer size={18} />
              Print Profile
            </Button>
          </div>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard
          title="Completed"
          value={completedAssessments}
          icon={FileText}
        />

        <StatCard title="Average" value={`${average}%`} icon={BarChart3} />

        <StatCard title="Highest" value={`${highest}%`} icon={Trophy} />

        <StatCard title="Pass Rate" value={`${passRate}%`} icon={CheckCircle} />
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <h2 className="text-xl font-bold text-slate-950">
            Student Information
          </h2>

          <div className="mt-5 space-y-4 text-sm">
            <InfoRow label="Full Name" value={studentName} />
            <InfoRow label="Student ID" value={studentId || "N/A"} />
            <InfoRow
              label="Registration No."
              value={student?.registrationNumber || "N/A"}
            />
            <InfoRow
              label="Student No."
              value={student?.studentNumber || "N/A"}
            />
            <InfoRow
              label="Programme"
              value={student?.programmeTitle || "N/A"}
            />
            <InfoRow
              label="Academic Year"
              value={student?.academicYear || "N/A"}
            />
            <InfoRow
              label="Year / Semester"
              value={`${student?.yearOfStudy || "N/A"} / ${
                student?.semester || "N/A"
              }`}
            />
            <InfoRow label="Intake" value={student?.intake || "N/A"} />
            <InfoRow
              label="Registered Status"
              value={student?.status || "N/A"}
            />
            <InfoRow label="Current Grade" value={currentGrade} />
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold text-slate-950">
            Academic Summary
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <SummaryBox
              label="Passed"
              value={passed}
              className="bg-green-50 text-green-700"
            />

            <SummaryBox
              label="Failed"
              value={failed}
              className="bg-red-50 text-red-700"
            />

            <SummaryBox
              label="Lowest"
              value={`${lowest}%`}
              className="bg-amber-50 text-amber-700"
            />
          </div>

          <div className="mt-6 rounded-2xl bg-blue-50 p-6 text-center">
            <p className="text-sm font-semibold text-blue-700">
              Overall Academic Standing
            </p>

            <p className="mt-2 text-4xl font-bold text-blue-800">
              {currentGrade}
            </p>

            <p className="mt-2 font-semibold text-slate-700">
              {academicStatus}
            </p>
          </div>
        </Card>
      </section>

      <section className="mb-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-slate-950">
            Learning Progress
          </h2>

          <div className="mt-5 space-y-4">
            <ProgressItem
              label="Assessments Completed"
              percentage={completedAssessments > 0 ? 100 : 0}
            />
            <ProgressItem label="Pass Rate" percentage={passRate} />
            <ProgressItem label="Academic Average" percentage={average} />
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">Quick Actions</h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <ActionButton
              icon={FileText}
              label="Assessment History"
              onClick={() => navigate("/assessment-history")}
            />

            <ActionButton
              icon={GraduationCap}
              label="Transcript"
              onClick={() =>
                navigate(`/tutor/student-transcript/${studentId}`)
              }
            />

            <ActionButton
              icon={Printer}
              label="Print Profile"
              onClick={() => window.print()}
            />

            <ActionButton
              icon={Mail}
              label="Email Report"
              onClick={() => alert("Email report coming next.")}
            />
          </div>
        </Card>
      </section>

      <Card>
        <h2 className="text-xl font-bold text-slate-950">Academic Timeline</h2>

        {studentAttempts.length === 0 ? (
          <p className="mt-4 text-slate-600">
            No completed assessment attempts yet.
          </p>
        ) : (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="p-3">Assessment</th>
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Score</th>
                  <th className="p-3">Percentage</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>

              <tbody>
                {studentAttempts.map((attempt) => {
                  const score = attempt.finalScore ?? attempt.score;
                  const percentage =
                    attempt.finalPercentage ?? attempt.percentage;
                  const passedAttempt = percentage >= 50;

                  return (
                    <tr key={attempt.id} className="border-b align-top">
                      <td className="p-3 font-semibold text-slate-950">
                        {attempt.quizTitle}
                      </td>

                      <td className="p-3">
                        {formatDate(attempt.submittedAt)}
                      </td>

                      <td className="p-3">
                        {score}/{attempt.totalMarks}
                      </td>

                      <td className="p-3 font-bold text-blue-700">
                        {percentage}%
                      </td>

                      <td className="p-3">{getGrade(percentage)}</td>

                      <td className="p-3">
                        {passedAttempt ? (
                          <StatusBadge passed />
                        ) : (
                          <StatusBadge passed={false} />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-2">
      <span className="font-medium text-slate-500">{label}</span>

      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function SummaryBox({
  label,
  value,
  className,
}: {
  label: string;
  value: string | number;
  className: string;
}) {
  return (
    <div className={`rounded-2xl p-5 text-center ${className}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-4xl font-bold">{value}</p>
    </div>
  );
}

function ProgressItem({
  label,
  percentage,
}: {
  label: string;
  percentage: number;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium text-slate-700">{label}</span>

        <span className="font-semibold text-blue-700">{percentage}%</span>
      </div>

      <div className="h-3 overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-blue-700"
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
}

function ActionButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-400 hover:bg-blue-50"
    >
      <Icon size={22} className="text-blue-700" />

      <span className="font-semibold text-slate-800">{label}</span>
    </button>
  );
}

function StatusBadge({ passed }: { passed: boolean }) {
  return passed ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
      <CheckCircle size={16} />
      PASS
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      <XCircle size={16} />
      FAIL
    </span>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
}) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold text-slate-950">{value}</p>
        </div>

        <Icon size={34} className="text-blue-700" />
      </div>
    </Card>
  );
}