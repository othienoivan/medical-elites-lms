import {
  CalendarClock,
  CheckCircle,
  ClipboardCheck,
  Clock,
  Eye,
  FileText,
  Lock,
  Trophy,
  XCircle,
} from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useQuizAttempts from "../hooks/useQuizAttempts";
import useQuizzes from "../hooks/useQuizzes";
import useStudentLearningAccess from "../hooks/useStudentLearningAccess";
import type { AssessmentType } from "../models/Quiz";

const assessmentTypes: {
  value: "all" | AssessmentType;
  label: string;
}[] = [
  { value: "all", label: "All" },
  { value: "lesson-quiz", label: "Lesson Quizzes" },
  { value: "short-quiz", label: "Short Quizzes" },
  { value: "cat", label: "CATs" },
  { value: "module-test", label: "Module Tests" },
  { value: "practice-test", label: "Practice Tests" },
  { value: "mock-exam", label: "Mock Exams" },
  { value: "final-exam", label: "Final Exams" },
];

export default function StudentAssessmentPage() {
  const navigate = useNavigate();

  const { quizzes, loading: quizzesLoading } = useQuizzes();
  const { attempts, loading: attemptsLoading } = useQuizAttempts();
  const {
    canAccessQuiz,
    loading: accessLoading,
    error: accessError,
  } = useStudentLearningAccess();

  const [filter, setFilter] = useState<"available" | "completed">("available");
  const [assessmentType, setAssessmentType] =
    useState<"all" | AssessmentType>("all");

  const completedAssessmentKeys = useMemo(() => {
    const keys = new Set<string>();

    attempts.forEach((attempt) => {
      if (attempt.quizId) keys.add(`id:${attempt.quizId}`);

      const title = attempt.quizTitle?.trim().toLowerCase();
      if (title) keys.add(`title:${title}`);
    });

    return keys;
  }, [attempts]);

  const hasCompletedQuiz = useCallback(
    (quiz: { id: string; title: string }) => {
      return (
        completedAssessmentKeys.has(`id:${quiz.id}`) ||
        completedAssessmentKeys.has(
          `title:${quiz.title.trim().toLowerCase()}`
        )
      );
    },
    [completedAssessmentKeys]
  );

  const visibleAssessments = useMemo(() => {
    const now = new Date();

    return quizzes.filter((quiz) => {
      const isPublished = quiz.status === "published";
      const isAssigned = canAccessQuiz(quiz);
      const isNotArchived = !quiz.isArchived;
      const isNotCompleted = !hasCompletedQuiz(quiz);

      const fromDate = normalizeDate(quiz.availableFrom);
      const untilDate = normalizeDate(quiz.availableUntil);

      const hasOpened = !fromDate || fromDate <= now;
      const hasNotClosed =
        !untilDate || untilDate >= now || quiz.allowLateSubmission === true;

      const matchesType =
        assessmentType === "all" ||
        quiz.assessmentType === assessmentType ||
        (!quiz.assessmentType && assessmentType === "lesson-quiz");

      return (
        isPublished &&
        isAssigned &&
        isNotArchived &&
        isNotCompleted &&
        hasOpened &&
        hasNotClosed &&
        matchesType
      );
    });
  }, [quizzes, assessmentType, canAccessQuiz, hasCompletedQuiz]);

  const completedAttempts = useMemo(() => {
    return attempts
      .slice()
      .sort((a, b) => {
        const aTime = normalizeDate(a.submittedAt)?.getTime() || 0;
        const bTime = normalizeDate(b.submittedAt)?.getTime() || 0;

        return bTime - aTime;
      });
  }, [attempts]);

  const upcomingAssessments = useMemo(() => {
    const now = new Date();

    return quizzes.filter((quiz) => {
      const fromDate = normalizeDate(quiz.availableFrom);

      return (
        quiz.status === "published" &&
        canAccessQuiz(quiz) &&
        !quiz.isArchived &&
        fromDate !== null &&
        fromDate > now &&
        !hasCompletedQuiz(quiz)
      );
    });
  }, [quizzes, canAccessQuiz, hasCompletedQuiz]);

  const totalTimeSpentSeconds = useMemo(() => {
    return attempts.reduce(
      (sum, attempt) => sum + (attempt.durationSeconds || 0),
      0
    );
  }, [attempts]);

  const loading = quizzesLoading || attemptsLoading || accessLoading;
    return (
    <main className="min-h-screen bg-slate-100 px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <h1 className="text-3xl font-bold">My Assessments</h1>

          <p className="mt-2 text-blue-100">
            Take lesson quizzes, CATs, module tests, practice tests and mock
            examinations.
          </p>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-4">
          <StatCard
            title="Available"
            value={visibleAssessments.length}
            icon={ClipboardCheck}
          />

          <StatCard
            title="Completed"
            value={completedAttempts.length}
            icon={Trophy}
          />

          <StatCard
            title="Upcoming Exams"
            value={upcomingAssessments.length}
            icon={FileText}
          />

          <StatCard
            title="Time Spent"
            value={formatDuration(totalTimeSpentSeconds)}
            icon={Clock}
          />
        </div>

        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-3">
            <Button
              variant={filter === "available" ? "primary" : "outline"}
              onClick={() => setFilter("available")}
            >
              Available
            </Button>

            <Button
              variant={filter === "completed" ? "primary" : "outline"}
              onClick={() => setFilter("completed")}
            >
              Completed
            </Button>
          </div>

          <select
            aria-label="Filter assessments by type"
            title="Filter assessments by type"
            value={assessmentType}
            onChange={(event) =>
              setAssessmentType(event.target.value as "all" | AssessmentType)
            }
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
          >
            {assessmentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {accessError ? (
          <Card className="border-red-200 bg-red-50 text-red-800">
            {accessError}
          </Card>
        ) : loading ? (
          <Card>Loading assessments...</Card>
        ) : filter === "completed" ? (
          completedAttempts.length === 0 ? (
            <Card className="text-center">
              <Trophy size={52} className="mx-auto text-slate-400" />

              <h2 className="mt-4 text-xl font-bold">
                No completed assessments yet
              </h2>

              <p className="mt-2 text-slate-600">
                Completed quizzes and exam results will appear here.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {completedAttempts.map((attempt) => {
                const displayScore = attempt.finalScore ?? attempt.score;
                const displayPercentage =
                  attempt.finalPercentage ?? attempt.percentage;
                const displayPassed = displayPercentage >= 50;

                return (
                  <Card key={attempt.id}>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge passed={displayPassed} />
                      <ReleaseBadge released={attempt.released === true} />
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-950">
                      {attempt.quizTitle}
                    </h2>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge>
                        Score: {displayScore}/{attempt.totalMarks}
                      </Badge>

                      <Badge>{displayPercentage}%</Badge>

                      <Badge>
                        Duration: {formatDuration(attempt.durationSeconds)}
                      </Badge>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                      <InfoRow
                        icon={CalendarClock}
                        label="Submitted"
                        value={formatDateTime(attempt.submittedAt)}
                      />

                      <InfoRow
                        icon={FileText}
                        label="Questions"
                        value={`${attempt.answers.length}`}
                      />
                    </div>

                    {attempt.released ? (
                      <Button
                        className="mt-6 w-full"
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
                      <Button className="mt-6 w-full" variant="outline" disabled>
                        Pending Tutor Release
                      </Button>
                    )}
                  </Card>
                );
              })}
            </div>
          )
        ) : visibleAssessments.length === 0 ? (
          <Card className="text-center">
            <ClipboardCheck size={52} className="mx-auto text-slate-400" />

            <h2 className="mt-4 text-xl font-bold">No available assessments</h2>

            <p className="mt-2 text-slate-600">
              Published assessments will appear here when your tutor releases
              them.
            </p>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {visibleAssessments.map((quiz) => (
              <Card key={quiz.id}>
                <div className="flex flex-wrap gap-2">
                  <AssessmentTypeBadge
                    type={quiz.assessmentType || "lesson-quiz"}
                  />

                  {quiz.assessmentCode && <Badge>{quiz.assessmentCode}</Badge>}

                  {quiz.requiresPassword && (
                    <WarningBadge>
                      <Lock size={13} />
                      Password Required
                    </WarningBadge>
                  )}
                </div>

                <p className="mt-4 text-sm font-semibold text-blue-700">
                  {quiz.moduleTitle ||
                    quiz.courseUnitTitle ||
                    quiz.programmeTitle ||
                    "General Assessment"}
                </p>

                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  {quiz.title}
                </h2>

                <p className="mt-2 text-slate-600">{quiz.description}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge>{quiz.questions.length} Questions</Badge>
                  <Badge>{quiz.totalMarks} Marks</Badge>
                  <Badge>Pass: {quiz.passMark}%</Badge>

                  {quiz.timeLimitMinutes && (
                    <Badge>{quiz.timeLimitMinutes} Minutes</Badge>
                  )}

                  {quiz.weightPercentage !== undefined &&
                    quiz.weightPercentage !== null && (
                      <Badge>Weight: {quiz.weightPercentage}%</Badge>
                    )}
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2">
                  <InfoRow
                    icon={CalendarClock}
                    label="Available From"
                    value={formatDateTime(quiz.availableFrom)}
                  />

                  <InfoRow
                    icon={CalendarClock}
                    label="Closes"
                    value={formatDateTime(quiz.availableUntil)}
                  />
                </div>

                <Button
                  className="mt-6 w-full"
                  onClick={() => navigate(`/assessments/quizzes/${quiz.id}`)}
                >
                  Start Assessment
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}function normalizeDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

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

function formatDateTime(value: unknown) {
  const date = normalizeDate(value);

  if (!date) return "Not set";

  return date.toLocaleString();
}

function formatDuration(seconds: number) {
  if (!seconds || seconds <= 0) return "0m";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function getAssessmentTypeLabel(type: AssessmentType) {
  switch (type) {
    case "lesson-quiz":
      return "Lesson Quiz";
    case "short-quiz":
      return "Short Quiz";
    case "cat":
      return "CAT";
    case "module-test":
      return "Module Test";
    case "practice-test":
      return "Practice Test";
    case "mock-exam":
      return "Mock Exam";
    case "final-exam":
      return "Final Exam";
    default:
      return "Assessment";
  }
}

function AssessmentTypeBadge({ type }: { type: AssessmentType }) {
  return (
    <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-800">
      {getAssessmentTypeLabel(type)}
    </span>
  );
}

function StatusBadge({ passed }: { passed: boolean }) {
  return passed ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
      <CheckCircle size={14} />
      Passed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      <XCircle size={14} />
      Failed
    </span>
  );
}

function ReleaseBadge({ released }: { released: boolean }) {
  return released ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
      <CheckCircle size={14} />
      Released
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
      <Clock size={14} />
      Pending Release
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

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}

function WarningBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-800">
      {children}
    </span>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
      <Icon size={16} className="mt-0.5 text-blue-700" />

      <div>
        <p className="font-semibold text-slate-800">{label}</p>
        <p className="mt-1 text-slate-600">{value}</p>
      </div>
    </div>
  );
}