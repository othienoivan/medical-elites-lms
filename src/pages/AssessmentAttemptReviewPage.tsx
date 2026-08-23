import { Calendar, CheckCircle, Clock, FileText, Trophy, XCircle } from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import useQuizAttempts from "../hooks/useQuizAttempts";

export default function AssessmentAttemptReviewPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { attempts, loading } = useQuizAttempts();

  const attempt = useMemo(
    () => attempts.find((item) => item.id === attemptId),
    [attempts, attemptId]
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card>Loading attempt review...</Card>
        </Container>
      </main>
    );
  }

  if (!attempt) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card>Attempt not found.</Card>
        </Container>
      </main>
    );
  }

  if (!attempt.released) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10"><Card>This assessment review will become available after your tutor releases the results.</Card></Container>
      </main>
    );
  }

  const correct = attempt.answers.filter((answer) => answer.isCorrect).length;
  const wrong = attempt.answers.length - correct;

  return (
    <main className="min-h-screen bg-slate-100">
      <Container className="py-10">
        <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <h1 className="text-3xl font-bold">Assessment Review</h1>

          <p className="mt-2 text-blue-100">{attempt.quizTitle}</p>

          <Button
            className="mt-6 bg-white text-blue-700 hover:bg-blue-50"
            onClick={() => navigate("/assessment-history")}
          >
            Back to History
          </Button>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard title="Score" value={`${attempt.finalScore ?? attempt.score}/${attempt.totalMarks}`} icon={Trophy} />
          <StatCard title="Percentage" value={`${attempt.finalPercentage ?? attempt.percentage}%`} icon={FileText} />
          <StatCard title="Correct" value={correct} icon={CheckCircle} />
          <StatCard title="Wrong" value={wrong} icon={XCircle} />
        </section>

        <Card className="mb-8">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoItem icon={Calendar} label="Submitted" value={formatDate(attempt.submittedAt)} />
            <InfoItem icon={Clock} label="Duration" value={`${Math.round(attempt.durationSeconds / 60)} min`} />
            <InfoItem
              icon={attempt.passed ? CheckCircle : XCircle}
              label="Status"
              value={attempt.passed ? "Passed" : "Failed"}
            />
          </div>
        </Card>

        <div className="space-y-5">
          {attempt.answers.map((answer, index) => {
            const snapshot = attempt.questionSnapshots?.find((item) => item.id === answer.questionId);
            const manualMark = attempt.manualMarks?.find((item) => item.questionId === answer.questionId);
            const awarded = manualMark?.marksAwarded ?? answer.marksAwarded;
            return (
              <Card key={`${answer.questionId}-${index}`}>
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-blue-700">Question {index + 1}</p>
                    <p className="mt-2 font-semibold text-slate-950">{snapshot?.questionText || `Question ${index + 1}`}</p>
                    <p className="mt-3 text-slate-700">Your answer: <span className="font-semibold">{answer.selectedOptionId || answer.textAnswer || "Not answered"}</span></p>
                    {snapshot?.correctAnswer && <p className="mt-2 text-slate-700">Correct / model answer: <span className="font-semibold">{snapshot.correctAnswer}</span></p>}
                    <p className="mt-2 text-slate-700">Marks awarded: <span className="font-semibold">{awarded}{snapshot?.marks ? ` / ${snapshot.marks}` : ""}</span></p>
                    {manualMark?.feedback?.trim() && (
                      <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <p className="text-sm font-bold text-blue-900">Tutor Feedback</p>
                        <p className="mt-1 whitespace-pre-wrap text-slate-800">{manualMark.feedback}</p>
                      </div>
                    )}
                    {snapshot?.explanation && <p className="mt-3 text-sm text-slate-600"><strong>Explanation:</strong> {snapshot.explanation}</p>}
                  </div>
                  {answer.isCorrect ? <StatusBadge passed /> : <StatusBadge passed={false} />}
                </div>
              </Card>
            );
          })}
        </div>
        {attempt.tutorRemarks?.trim() && (
          <Card className="mt-8 border-blue-200 bg-blue-50">
            <h2 className="text-lg font-bold text-blue-950">Overall Tutor Feedback</h2>
            <p className="mt-2 whitespace-pre-wrap text-slate-800">{attempt.tutorRemarks}</p>
          </Card>
        )}
      </Container>
    </main>
  );
}

function formatDate(value: unknown) {
  if (!value) return "-";

  if (value instanceof Date) return value.toLocaleString();

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toLocaleString();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  }

  return "-";
}

function StatusBadge({ passed }: { passed: boolean }) {
  return passed ? (
    <span className="inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
      <CheckCircle size={16} />
      Correct
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      <XCircle size={16} />
      Wrong
    </span>
  );
}

function InfoItem({
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