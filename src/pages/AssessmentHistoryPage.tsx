import {
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileText,
  Trophy,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import useQuizAttempts from "../hooks/useQuizAttempts";

export default function AssessmentHistoryPage() {
  const navigate = useNavigate();
  const { attempts, loading } = useQuizAttempts();

  const passed = attempts.filter(
    (attempt) => (attempt.finalPercentage ?? attempt.percentage) >= 50
  ).length;

  const failed = attempts.length - passed;

  const average =
    attempts.length > 0
      ? Math.round(
          attempts.reduce(
            (sum, attempt) =>
              sum + (attempt.finalPercentage ?? attempt.percentage),
            0
          ) / attempts.length
        )
      : 0;

  return (
    <main className="min-h-screen bg-slate-100">
      <Container className="py-10">
        <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <h1 className="text-3xl font-bold">Assessment History</h1>

          <p className="mt-2 max-w-3xl text-blue-100">
            View completed quizzes, CATs, module tests and examinations with
            scores, duration, release status and pass/fail status.
          </p>

          <Button
            className="mt-6 bg-white text-blue-700 hover:bg-blue-50"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
        </section>

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard title="Completed" value={attempts.length} icon={FileText} />
          <StatCard title="Passed" value={passed} icon={CheckCircle} />
          <StatCard title="Failed" value={failed} icon={XCircle} />
          <StatCard title="Average" value={`${average}%`} icon={Trophy} />
        </section>

        {loading ? (
          <Card>Loading assessment history...</Card>
        ) : attempts.length === 0 ? (
          <Card>
            <p className="text-center text-slate-500">
              No assessment attempts yet.
            </p>
          </Card>
        ) : (
          <div className="space-y-5">
            {attempts.map((attempt) => {
              const displayScore = attempt.finalScore ?? attempt.score;
              const displayPercentage =
                attempt.finalPercentage ?? attempt.percentage;
              const displayPassed = displayPercentage >= 50;

              return (
                <Card key={attempt.id}>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge passed={displayPassed} />

                        <ReleaseBadge released={attempt.released === true} />
                      </div>

                      <h2 className="mt-3 text-xl font-bold text-slate-950">
                        {attempt.quizTitle}
                      </h2>

                      <div className="mt-4 flex flex-wrap gap-5 text-sm text-slate-500">
                        <InfoItem
                          icon={Calendar}
                          text={formatDate(attempt.submittedAt)}
                        />

                        <InfoItem
                          icon={Clock}
                          text={`${Math.round(
                            attempt.durationSeconds / 60
                          )} min`}
                        />

                        <InfoItem
                          icon={FileText}
                          text={`${attempt.answers.length} question(s)`}
                        />
                      </div>
                    </div>

                    <div className="text-left lg:text-right">
                      <div className="flex items-center gap-2 lg:justify-end">
                        <Trophy className="text-amber-500" size={22} />

                        <span className="text-3xl font-bold text-blue-700">
                          {displayPercentage}%
                        </span>
                      </div>

                      <p className="mt-2 text-slate-600">
                        {displayScore}/{attempt.totalMarks} Marks
                      </p>

                      {attempt.released ? (
                        <Button
                          className="mt-4"
                          variant="outline"
                          onClick={() =>
                            navigate(
                              `/assessment-history/${attempt.id}/result-slip`
                            )
                          }
                        >
                          <Eye size={16} />
                          View Result Slip
                        </Button>
                      ) : (
                        <Button className="mt-4" variant="outline" disabled>
                          Pending Release
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}

function formatDate(value: unknown) {
  if (!value) return "-";

  if (value instanceof Date) {
    return value.toLocaleString();
  }

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
      <Clock size={16} />
      Pending Release
    </span>
  );
}

function InfoItem({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={16} />
      {text}
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