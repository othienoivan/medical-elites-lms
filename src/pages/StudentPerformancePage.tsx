import {
  BarChart3,
  Calendar,
  CheckCircle,
  Download,
  FileText,
  Printer,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useTutorQuizAttempts from "../hooks/useTutorQuizAttempts";
import { grantStudentLearningProgressionOverride } from "../firebase/quizAttempts";

export default function StudentPerformancePage() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cohortId = searchParams.get("cohort") || "";
  const { attempts, loading } = useTutorQuizAttempts();

  async function grantProgression(quizId: string) {
    if (!studentId) return;
    const reason = window.prompt("Reason for manually granting access to the next lesson/module:", "Tutor-authorised progression despite unmet assessment pass mark.");
    if (!reason?.trim()) return;
    try {
      const result = await grantStudentLearningProgressionOverride({ studentId, quizId, reason: reason.trim() });
      window.alert(`Progression access granted. Student can continue to ${result.targetLessonId ? "the next lesson" : "the next module"}.`);
    } catch (error) {
      console.error("Failed to grant progression access:", error);
      window.alert(error instanceof Error ? error.message : "Progression access could not be granted.");
    }
  }

  const studentAttempts = useMemo(() => {
    return attempts
      .filter((attempt) => {
        if (attempt.studentId !== studentId) return false;
        if (!cohortId) return true;
        const attemptCohort = attempt.assessmentGroupId || attempt.studentGroupId || attempt.registrationLinkId || "legacy";
        return attemptCohort === cohortId;
      })
      .sort((a, b) => {
        const aTime = normalizeDate(a.submittedAt)?.getTime() || 0;
        const bTime = normalizeDate(b.submittedAt)?.getTime() || 0;
        return bTime - aTime;
      });
  }, [attempts, cohortId, studentId]);

  const studentName = studentAttempts[0]?.studentName || "Student";
  const cohortName = studentAttempts[0]?.registrationLinkName || studentAttempts[0]?.classInstitutionName || (cohortId && cohortId !== "legacy" ? cohortId : "All classes");

  const percentages = studentAttempts.map(
    (attempt) => attempt.finalPercentage ?? attempt.percentage
  );

  const average =
    percentages.length > 0
      ? Math.round(
          percentages.reduce((sum, value) => sum + value, 0) /
            percentages.length
        )
      : 0;

  const highest = percentages.length > 0 ? Math.max(...percentages) : 0;
  const lowest = percentages.length > 0 ? Math.min(...percentages) : 0;

  const passed = studentAttempts.filter((attempt) => {
    const percentage = attempt.finalPercentage ?? attempt.percentage;
    const passMark = attempt.passMarkAtSubmission ?? attempt.passMark ?? 50;
    return percentage >= passMark;
  }).length;
  const failed = studentAttempts.length - passed;

  if (loading) {
    return (
      <TutorLayout
        title="Student Performance"
        subtitle="Loading student academic profile."
      >
        <Card>Loading student performance...</Card>
      </TutorLayout>
    );
  }

  if (studentAttempts.length === 0) {
    return (
      <TutorLayout
        title="Student Performance"
        subtitle="No assessment attempts found for this student."
      >
        <Card className="text-center">
          <User size={52} className="mx-auto text-slate-400" />

          <h2 className="mt-4 text-xl font-bold text-slate-950">
            No performance records found
          </h2>

          <p className="mt-2 text-slate-600">
            This student has no completed assessment attempts yet.
          </p>

          <Button
            className="mt-6"
            variant="outline"
            onClick={() => navigate("/tutor/automatic-gradebook")}
          >
            Back to Gradebook
          </Button>
        </Card>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout
      title="Student Performance"
      subtitle="Detailed assessment profile for one student."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">{studentName}</h2>

            <p className="mt-2 text-blue-100">
              Academic performance summary for {cohortName}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => navigate("/tutor/automatic-gradebook")}
            >
              Back to Gradebook
            </Button>

            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => window.print()}
            >
              <Printer size={18} />
              Print Report
            </Button>
          </div>
        </div>
      </section>

<Button
  className="bg-white text-blue-700 hover:bg-blue-50"
  onClick={() => navigate(`/tutor/student-transcript/${studentId}`)}
>
  <Download size={18} />
  Transcript
</Button>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard
          title="Completed"
          value={studentAttempts.length}
          icon={FileText}
        />
        <StatCard title="Average" value={`${average}%`} icon={BarChart3} />
        <StatCard title="Highest" value={`${highest}%`} icon={Trophy} />
        <StatCard title="Lowest" value={`${lowest}%`} icon={XCircle} />
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold text-slate-950">
            Pass / Fail Summary
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
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
          </div>
        </Card>

        <Card>
          <h2 className="text-xl font-bold text-slate-950">Overall Grade</h2>

          <div className="mt-5 rounded-2xl bg-blue-50 p-6 text-center">
            <p className="text-sm font-semibold text-blue-700">
              Current Grade
            </p>

            <p className="mt-2 text-5xl font-bold text-blue-800">
              {getGrade(average)}
            </p>

            <p className="mt-3 font-semibold text-slate-700">
              {average >= 50 ? "Good Standing" : "Needs Academic Support"}
            </p>
          </div>
        </Card>
      </section>

      <Card>
        <h2 className="text-xl font-bold text-slate-950">
          Assessment Timeline
        </h2>

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
                <th className="p-3">Release</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {studentAttempts.map((attempt) => {
                const finalScore = attempt.finalScore ?? attempt.score;
                const finalPercentage =
                  attempt.finalPercentage ?? attempt.percentage;
                const passMark = attempt.passMarkAtSubmission ?? attempt.passMark ?? 50;
                const passedAttempt = finalPercentage >= passMark;

                return (
                  <tr key={attempt.id} className="border-b align-top">
                    <td className="p-3 font-semibold text-slate-950">
                      {attempt.quizTitle}
                    </td>

                    <td className="p-3">
                      <InfoInline
                        icon={Calendar}
                        text={formatDate(attempt.submittedAt)}
                      />
                    </td>

                    <td className="p-3">
                      {finalScore}/{attempt.totalMarks}
                    </td>

                    <td className="p-3 font-bold text-blue-700">
                      {finalPercentage}%
                    </td>

                    <td className="p-3">
                      <GradeBadge grade={getGrade(finalPercentage)} />
                    </td>

                    <td className="p-3">
                      {passedAttempt ? (
                        <StatusBadge passed />
                      ) : (
                        <StatusBadge passed={false} />
                      )}
                    </td>

                    <td className="p-3">
                      {attempt.released ? (
                        <ReleaseBadge released />
                      ) : (
                        <ReleaseBadge released={false} />
                      )}
                    </td>

                    <td className="p-3">
                      <div className="flex flex-col gap-2">
                        {attempt.released ? (
                          <Button variant="outline" onClick={() => navigate(`/assessment-history/${attempt.id}/result-slip`)}>View Slip</Button>
                        ) : (
                          <Button variant="outline" disabled>Pending</Button>
                        )}
                        {!passedAttempt && (attempt.lessonId || attempt.moduleId) && (
                          <Button variant="outline" onClick={() => void grantProgression(attempt.quizId)}>Grant Next Lesson / Module</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

function GradeBadge({ grade }: { grade: string }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {grade}
    </span>
  );
}

function StatusBadge({ passed }: { passed: boolean }) {
  return passed ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
      <CheckCircle size={16} />
      Passed
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      <XCircle size={16} />
      Failed
    </span>
  );
}

function ReleaseBadge({ released }: { released: boolean }) {
  return released ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
      <CheckCircle size={16} />
      Released
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-700">
      <Calendar size={16} />
      Pending
    </span>
  );
}

function InfoInline({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 text-slate-600">
      <Icon size={15} />
      {text}
    </span>
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