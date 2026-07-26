import {
  CalendarClock,
  CheckCircle,
  ClipboardCheck,
  Clock,
  FileText,
  Lock,
  Trophy,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Container from "../components/ui/Container";
import Input from "../components/ui/Input";
import { getQuizAttemptsByStudent } from "../firebase/quizAttempts";
import { getQuizById } from "../firebase/quizzes";
import useAuth from "../hooks/useAuth";
import type { AssessmentType, Quiz } from "../models/Quiz";
import type { QuizAttempt } from "../models/QuizAttempt";

export default function AssessmentEntryPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAssessmentEntry() {
      if (!quizId) return;

      try {
        setLoading(true);

        const quizData = await getQuizById(quizId);
        setQuiz(quizData);

        if (currentUser) {
          const studentAttempts = await getQuizAttemptsByStudent(
            currentUser.uid
          );

          setAttempts(
            studentAttempts.filter((attempt) => attempt.quizId === quizId)
          );
        }
      } catch (error) {
        console.error("Failed to load assessment:", error);
        setError("Failed to load assessment.");
      } finally {
        setLoading(false);
      }
    }

    loadAssessmentEntry();
  }, [quizId, currentUser]);

  const completedAttempts = useMemo(() => {
    return attempts.filter((attempt) => attempt.completed);
  }, [attempts]);

  const attemptsAllowed = quiz?.attemptsAllowed || 1;

  const attemptsRemaining = Math.max(
    attemptsAllowed - completedAttempts.length,
    0
  );

  function handleStart() {
    if (!quiz) return;

    setError("");

    const now = new Date();
    const fromDate = normalizeDate(quiz.availableFrom);
    const untilDate = normalizeDate(quiz.availableUntil);

    if (quiz.isArchived) {
      setError("Assessment archived.");
      return;
    }

    if (quiz.status !== "published") {
      setError("Assessment is not published.");
      return;
    }

    if (fromDate && fromDate > now) {
      setError("Assessment has not opened yet.");
      return;
    }

    if (untilDate && untilDate < now && !quiz.allowLateSubmission) {
      setError("Assessment closed.");
      return;
    }

    if (completedAttempts.length >= attemptsAllowed) {
      setError("Maximum attempts reached.");
      return;
    }

    if (quiz.requiresPassword && password.trim() !== quiz.accessPassword) {
      setError("Incorrect password.");
      return;
    }

    if (!acceptedRules) {
      setError("Please confirm that you understand the assessment rules.");
      return;
    }

    navigate(`/assessments/quizzes/${quiz.id}/take`);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card>Loading assessment...</Card>
        </Container>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="min-h-screen bg-slate-100">
        <Container className="py-10">
          <Card>Assessment not found.</Card>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <Container className="py-10">
        <div className="mx-auto max-w-4xl">
          <Card>
            <div className="border-b border-slate-200 pb-6">
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

                {completedAttempts.length >= attemptsAllowed && (
                  <WarningBadge>Maximum Attempts Reached</WarningBadge>
                )}
              </div>

              <h1 className="mt-4 text-3xl font-bold text-slate-950">
                {quiz.title}
              </h1>

              <p className="mt-2 text-slate-600">{quiz.description}</p>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <InfoBox
                icon={ClipboardCheck}
                label="Assessment Type"
                value={getAssessmentTypeLabel(
                  quiz.assessmentType || "lesson-quiz"
                )}
              />

              <InfoBox
                icon={FileText}
                label="Module / Course"
                value={
                  quiz.moduleTitle ||
                  quiz.courseUnitTitle ||
                  quiz.programmeTitle ||
                  "General Assessment"
                }
              />

              <InfoBox
                icon={Clock}
                label="Time Limit"
                value={
                  quiz.timeLimitMinutes
                    ? `${quiz.timeLimitMinutes} minutes`
                    : "Not set"
                }
              />

              <InfoBox
                icon={Trophy}
                label="Total Marks"
                value={`${quiz.totalMarks}`}
              />

              <InfoBox
                icon={CheckCircle}
                label="Pass Mark"
                value={`${quiz.passMark}%`}
              />

              <InfoBox
                icon={ClipboardCheck}
                label="Attempts Allowed"
                value={`${attemptsAllowed}`}
              />

              <InfoBox
                icon={ClipboardCheck}
                label="Attempts Used"
                value={`${completedAttempts.length}`}
              />

              <InfoBox
                icon={ClipboardCheck}
                label="Attempts Remaining"
                value={`${attemptsRemaining}`}
              />

              <InfoBox
                icon={CalendarClock}
                label="Opens"
                value={formatDateTime(quiz.availableFrom)}
              />

              <InfoBox
                icon={CalendarClock}
                label="Closes"
                value={formatDateTime(quiz.availableUntil)}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <h2 className="text-xl font-bold text-slate-950">
                Candidate Instructions
              </h2>

              <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                <li>• Answer all questions before submitting.</li>
                <li>• Do not refresh the browser during the assessment.</li>
                <li>• The timer starts immediately after you begin.</li>
                <li>• Submit before the time expires.</li>
                <li>• Your score will be recorded after submission.</li>
              </ul>
            </div>

            {quiz.requiresPassword && (
              <div className="mt-6">
                <label className="mb-2 block font-semibold text-slate-700">
                  Assessment Password
                </label>

                <Input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter assessment password"
                  disabled={completedAttempts.length >= attemptsAllowed}
                />
              </div>
            )}

            <label className="mt-6 flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={acceptedRules}
                onChange={(event) => setAcceptedRules(event.target.checked)}
                className="mt-1"
                disabled={completedAttempts.length >= attemptsAllowed}
              />
              I understand the assessment rules and I am ready to begin.
            </label>

            {error && (
              <div className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3 md:flex-row">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/assessments")}
              >
                Cancel
              </Button>

              <Button
                type="button"
                className="flex-1"
                onClick={handleStart}
                disabled={completedAttempts.length >= attemptsAllowed}
              >
                {completedAttempts.length >= attemptsAllowed
                  ? "Maximum Attempts Reached"
                  : "Start Assessment"}
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </main>
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

function formatDateTime(value: unknown) {
  const date = normalizeDate(value);
  return date ? date.toLocaleString() : "Not set";
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
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon size={20} className="mt-0.5 text-blue-700" />

      <div>
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <p className="mt-1 font-bold text-slate-950">{value}</p>
      </div>
    </div>
  );
}