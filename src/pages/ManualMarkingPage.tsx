import {
  ArrowLeft,
  CheckCircle,
  FileText,
  Save,
  RotateCcw,
  Trophy,
  User,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import {
  grantStudentQuizReattempt,
  grantStudentLearningProgressionOverride,
  releaseQuizAttemptResults,
  saveManualMarks,
} from "../firebase/quizAttempts";
import useAuth from "../hooks/useAuth";
import useQuizAttempt from "../hooks/useQuizAttempt";
import type { ManualMark } from "../models/QuizAttempt";

export default function ManualMarkingPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { attempt, loading, error, reload } = useQuizAttempt(attemptId);

  const [manualMarks, setManualMarks] = useState<ManualMark[]>([]);
  const [tutorRemarks, setTutorRemarks] = useState("");
  const [saving, setSaving] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [grantingReattempt, setGrantingReattempt] = useState(false);
  const [grantingProgression, setGrantingProgression] = useState(false);

  useEffect(() => {
    if (!attempt) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setManualMarks(attempt.manualMarks ?? []);
    setTutorRemarks(attempt.tutorRemarks ?? "");
  }, [attempt]);

  const manualTotal = manualMarks.reduce(
    (sum, item) => sum + item.marksAwarded,
    0
  );

  const currentTotal = attempt ? attempt.score + manualTotal : 0;

  const currentPercentage =
    attempt && attempt.totalMarks > 0
      ? Math.round((currentTotal / attempt.totalMarks) * 100)
      : 0;

  const configuredPassMark = attempt?.passMark ?? attempt?.passMarkAtSubmission ?? 50;
  const currentPassed = attempt ? currentPercentage >= configuredPassMark : false;

  function updateManualMark(
    questionId: string,
    field: keyof ManualMark,
    value: string | number
  ) {
    setManualMarks((current) => {
      const exists = current.some((item) => item.questionId === questionId);

      if (exists) {
        return current.map((item) =>
          item.questionId === questionId ? { ...item, [field]: value } : item
        );
      }

      return [
        ...current,
        {
          questionId,
          marksAwarded: field === "marksAwarded" ? Number(value) : 0,
          feedback: field === "feedback" ? String(value) : "",
        },
      ];
    });
  }

  function getManualMark(questionId: string) {
    return manualMarks.find((item) => item.questionId === questionId);
  }

  function prepareManualMarks() {
    return manualMarks.map((mark) => ({
      ...mark,
      markedBy: currentUser?.email || currentUser?.uid || "Tutor",
      markedAt: new Date(),
    }));
  }

  async function saveDraftMarks() {
    if (!attempt) return;

    try {
      setSaving(true);

      await saveManualMarks({
        attemptId: attempt.id,
        manualMarks: prepareManualMarks(),
        manualScore: manualTotal,
        finalScore: currentTotal,
        finalPercentage: currentPercentage,
        tutorRemarks,
      });

      await reload();
      alert("Manual marks saved successfully.");
    } catch (error) {
      console.error("Failed to save manual marks:", error);
      alert("Failed to save manual marks.");
    } finally {
      setSaving(false);
    }
  }


  async function grantReattempt() {
    if (!attempt) return;
    const reason = window.prompt(
      "Reason for granting one additional attempt:",
      "Additional reattempt granted after an unsuccessful assessment attempt.",
    );
    if (!reason?.trim()) return;
    const confirmed = window.confirm(
      `Grant ${attempt.studentName} one additional attempt for ${attempt.quizTitle}? This affects only this student.`,
    );
    if (!confirmed) return;

    try {
      setGrantingReattempt(true);
      const result = await grantStudentQuizReattempt({
        quizId: attempt.quizId,
        studentId: attempt.studentId,
        reason: reason.trim(),
        extraAttempts: 1,
      });
      alert(`One additional attempt granted. The student's effective limit is now ${result.maximumAttempts} attempt(s).`);
      await reload();
    } catch (error) {
      console.error("Failed to grant reattempt:", error);
      alert(error instanceof Error ? error.message : "Failed to grant the additional attempt.");
    } finally {
      setGrantingReattempt(false);
    }
  }

  async function grantProgressionAccess() {
    if (!attempt) return;
    const reason = window.prompt(
      "Reason for manually allowing this learner to proceed:",
      "Tutor-authorised progression despite not meeting the assessment pass mark.",
    );
    if (!reason?.trim()) return;
    try {
      setGrantingProgression(true);
      const result = await grantStudentLearningProgressionOverride({ studentId: attempt.studentId, quizId: attempt.quizId, reason: reason.trim() });
      alert(`Progression access granted. The learner can now continue to ${result.targetLessonId ? "the next lesson" : "the next module"}.`);
    } catch (error) {
      console.error("Failed to grant progression access:", error);
      alert(error instanceof Error ? error.message : "Failed to grant progression access.");
    } finally { setGrantingProgression(false); }
  }

  async function releaseResults() {
    if (!attempt) return;

    const confirmed = window.confirm(
      "Release these results to the student? This will publish the final score."
    );

    if (!confirmed) return;

    try {
      setReleasing(true);

      await releaseQuizAttemptResults({
        attemptId: attempt.id,
        manualMarks: prepareManualMarks(),
        manualScore: manualTotal,
        finalScore: currentTotal,
        finalPercentage: currentPercentage,
        tutorRemarks,
        passed: currentPassed,
      });

      alert("Results released successfully.");
      await reload();
      navigate("/tutor/submissions");
    } catch (error) {
      console.error("Failed to release results:", error);
      alert("Failed to release results.");
    } finally {
      setReleasing(false);
    }
  }

  if (loading) {
    return (
      <TutorLayout
        title="Manual Marking"
        subtitle="Load submitted assessment attempt."
      >
        <Card>Loading submission...</Card>
      </TutorLayout>
    );
  }

  if (error) {
    return (
      <TutorLayout title="Manual Marking" subtitle="Unable to load submission.">
        <Card className="text-center">
          <p className="font-semibold text-red-700">{error}</p>
          <Button className="mt-4" variant="outline" onClick={() => void reload()}>
            Try Again
          </Button>
        </Card>
      </TutorLayout>
    );
  }

  if (!attempt) {
    return (
      <TutorLayout
        title="Manual Marking"
        subtitle="Submission attempt could not be found."
      >
        <Card>Submission not found.</Card>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout
      title="Manual Marking"
      subtitle="Review submitted answers, award marks and prepare results for release."
    >
      <section className="mb-8 rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-3xl font-bold">Mark Submission</h2>
            <p className="mt-2 text-blue-100">{attempt.quizTitle}</p>
          </div>

          <Button
            className="bg-white text-blue-700 hover:bg-blue-50"
            onClick={() => navigate("/tutor/submissions")}
          >
            <ArrowLeft size={18} />
            Back to Inbox
          </Button>
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-4">
        <StatCard title="Auto Score" value={attempt.score} icon={Trophy} />
        <StatCard title="Manual Marks" value={manualTotal} icon={FileText} />
        <StatCard
          title="Current Total"
          value={`${currentTotal}/${attempt.totalMarks}`}
          icon={CheckCircle}
        />
        <StatCard
          title="Current %"
          value={`${currentPercentage}%`}
          icon={currentPassed ? CheckCircle : XCircle}
        />
      </section>

      <Card className="mb-8">
        <div className="grid gap-4 md:grid-cols-3">
          <InfoBox icon={User} label="Student" value={attempt.studentName} />
          <InfoBox
            icon={FileText}
            label="Assessment"
            value={attempt.quizTitle}
          />
          <InfoBox
            icon={Trophy}
            label="Submitted Score"
            value={`${attempt.score}/${attempt.totalMarks}`}
          />
        </div>
      </Card>

      <div className="space-y-5">
        {attempt.answers.map((answer, index) => {
          const manualMark = getManualMark(answer.questionId);
          const question = attempt.questionSnapshots?.find((item) => item.id === answer.questionId);

          return (
            <Card key={`${answer.questionId}-${index}`}>
              <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Question {index + 1}</Badge>
                    {answer.isCorrect ? <CorrectBadge /> : <WrongBadge />}
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <p className="font-semibold leading-7 text-slate-900">
                      {question?.questionText || "Question text unavailable"}
                    </p>
                    {question?.options && question.options.length > 0 && (
                      <div className="mt-3 grid gap-2 text-sm text-slate-600">
                        {question.options.map((option, optionIndex) => (
                          <p key={`${answer.questionId}-option-${option.id || optionIndex}`}>
                            <strong>{option.label || String.fromCharCode(65 + optionIndex)}.</strong> {option.text || ""}
                          </p>
                        ))}
                      </div>
                    )}
                    {question?.correctAnswer && (
                      <p className="mt-3 text-sm text-emerald-700"><strong>Expected answer:</strong> {question.correctAnswer}</p>
                    )}
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50 p-4">
                    <p className="text-sm font-semibold text-slate-500">
                      Student Answer
                    </p>

                    <p className="mt-2 text-slate-800">
                      {answer.selectedOptionId ||
                        answer.textAnswer ||
                        "Not answered"}
                    </p>
                  </div>

                  <p className="mt-4 text-sm text-slate-600">
                    Auto marks awarded:{" "}
                    <span className="font-bold">{answer.marksAwarded}</span>
                  </p>
                </div>

                <div className="w-full lg:w-80">
                  <label className="mb-2 block font-semibold text-slate-700">
                    Manual Marks
                  </label>

                  <Input
                    type="number"
                    min="0"
                    value={manualMark?.marksAwarded ?? 0}
                    onChange={(event) =>
                      updateManualMark(
                        answer.questionId,
                        "marksAwarded",
                        Number(event.target.value)
                      )
                    }
                  />

                  <label className="mb-2 mt-4 block font-semibold text-slate-700">
                    Tutor Feedback
                  </label>

                  <textarea
                    value={manualMark?.feedback ?? ""}
                    onChange={(event) =>
                      updateManualMark(
                        answer.questionId,
                        "feedback",
                        event.target.value
                      )
                    }
                    placeholder="Enter feedback for this answer..."
                    className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-8 border-l-4 border-l-blue-700">
        <div className="grid gap-4 md:grid-cols-4">
          <SummaryItem label="Auto Score" value={attempt.score} />
          <SummaryItem label="Manual Marks" value={manualTotal} />
          <SummaryItem
            label="Total"
            value={`${currentTotal}/${attempt.totalMarks}`}
          />
          <SummaryItem label="Percentage" value={`${currentPercentage}%`} />
        </div>

        <div className="mt-6">
          <label className="mb-2 block font-semibold text-slate-700">
            Overall Tutor Remarks
          </label>

          <textarea
            value={tutorRemarks}
            onChange={(event) => setTutorRemarks(event.target.value)}
            placeholder="Enter overall tutor remarks for this submission..."
            className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
          />
        </div>

        {!currentPassed && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="font-semibold text-amber-900">Student-specific reattempt</p>
            <p className="mt-1 text-sm text-amber-800">
              If this learner has exhausted the normal attempt limit and cannot progress without passing, grant one extra attempt without changing the quiz limit for other students.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button type="button" variant="outline" onClick={() => void grantReattempt()} disabled={saving || releasing || grantingReattempt || grantingProgression}>
                <RotateCcw size={18} />
                {grantingReattempt ? "Granting..." : "Grant One Extra Attempt"}
              </Button>
              {(attempt.lessonId || attempt.moduleId) && (
                <Button type="button" variant="outline" onClick={() => void grantProgressionAccess()} disabled={saving || releasing || grantingReattempt || grantingProgression}>
                  {grantingProgression ? "Granting Access..." : "Grant Access to Next Lesson / Module"}
                </Button>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 md:flex-row">
          <Button
            variant="outline"
            className="flex-1"
            onClick={saveDraftMarks}
            disabled={saving || releasing}
          >
            <Save size={18} />
            {saving ? "Saving..." : "Save Draft Marks"}
          </Button>

          <Button
            className="flex-1"
            onClick={releaseResults}
            disabled={saving || releasing}
          >
            <CheckCircle size={18} />
            {releasing ? "Releasing..." : "Release Results"}
          </Button>
        </div>
      </Card>
    </TutorLayout>
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

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}

function CorrectBadge() {
  return (
    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
      Correct
    </span>
  );
}

function WrongBadge() {
  return (
    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
      Wrong
    </span>
  );
}