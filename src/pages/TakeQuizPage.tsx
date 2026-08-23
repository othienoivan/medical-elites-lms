import { useEffect, useMemo, useRef, useState } from "react";
import { Flag, RotateCcw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import QuestionCard from "../components/quiz/QuestionCard";
import QuestionPalette from "../components/quiz/QuestionPalette";
import QuizHeader from "../components/quiz/QuizHeader";
import QuizNavigation from "../components/quiz/QuizNavigation";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import {
  createQuizAttempt,
  deleteQuizDraftAttempt,
  getQuizDraftAttempt,
  getQuizAttemptUsage,
  getStudentPostQuizDestination,
  requestStudentQuizReattempt,
  saveQuizDraftAttempt,
} from "../firebase/quizAttempts";
import { getStudentAssessmentPackage } from "../firebase/studentAssessments";
import { completeLessonLearning } from "../firebase/lessonProgress";
import useAuth from "../hooks/useAuth";
import type { Question } from "../models/Question";
import type { Quiz } from "../models/Quiz";
import type { QuizAnswer } from "../models/QuizAttempt";
import type { QuizAttemptUsage } from "../firebase/quizAttempts";

type StudentAnswer = {
  questionId: string;
  answer: string;
};

export default function TakeQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [linkedQuestions, setLinkedQuestions] = useState<Question[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<StudentAnswer[]>([]);
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);

  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [startedAt] = useState(new Date());

  const [submitted, setSubmitted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [savingAttempt, setSavingAttempt] = useState(false);
  const [aiFinalResult, setAiFinalResult] = useState<{
    finalScore?: number;
    finalPercentage?: number;
    passed?: boolean;
    needsTutorReview?: boolean;
  } | null>(null);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [attemptUsage, setAttemptUsage] = useState<QuizAttemptUsage | null>(null);
  const [attemptUsageLoading, setAttemptUsageLoading] = useState(true);
  const [requestingReattempt, setRequestingReattempt] = useState(false);
  const [reattemptRequestMessage, setReattemptRequestMessage] = useState<string | null>(null);
  const submitHandlerRef = useRef<(autoSubmit?: boolean) => Promise<void>>(
    async () => undefined
  );

  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) return;

      try {
        setLoadingQuiz(true);

        const assessmentPackage = await getStudentAssessmentPackage(quizId);
        const data = assessmentPackage.quiz;
        const questions = Array.isArray(assessmentPackage.questions)
          ? assessmentPackage.questions
          : [];

        setQuiz(data);
        setLinkedQuestions(questions);

        if (data) {
          const resolvedTimeLimitMinutes = Math.max(
            1,
            Math.floor(
              Number(
                data.timeLimitMinutes ??
                  (data as Quiz & { durationMinutes?: number }).durationMinutes ??
                  30,
              ),
            ),
          );

          setSecondsRemaining(resolvedTimeLimitMinutes * 60);
        }
      } catch (error) {
        console.error("Failed to load quiz:", error);
      } finally {
        setLoadingQuiz(false);
        setQuestionsLoading(false);
      }
    }

    loadQuiz();
  }, [quizId]);

  useEffect(() => {
    async function loadAttemptUsage() {
      if (!quiz || !currentUser) {
        setAttemptUsageLoading(false);
        return;
      }

      try {
        setAttemptUsageLoading(true);
        const maximumAttempts = Math.max(1, Math.floor(quiz.attemptsAllowed ?? 1));
        setAttemptUsage(await getQuizAttemptUsage({
          quizId: quiz.id,
          studentId: currentUser.uid,
          maximumAttempts,
        }));
      } catch (error) {
        console.error("Failed to load quiz attempt usage:", error);
      } finally {
        setAttemptUsageLoading(false);
      }
    }

    void loadAttemptUsage();
  }, [quiz, currentUser]);

  const attemptsExhausted = Boolean(attemptUsage && attemptUsage.attemptsRemaining <= 0);

  useEffect(() => {
    if (!quiz || submitted || attemptsExhausted || secondsRemaining <= 0) return;

    const interval = window.setInterval(() => {
      setSecondsRemaining((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          void submitHandlerRef.current(true);
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [quiz, submitted, attemptsExhausted, secondsRemaining]);

  useEffect(() => {
    if (submitted) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handler);

    return () => window.removeEventListener("beforeunload", handler);
  }, [submitted]);

  useEffect(() => {
    if (!quiz || submitted || attemptsExhausted) return;

    async function enterFullscreen() {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        console.warn("Fullscreen mode was not enabled.");
      }
    }

    enterFullscreen();
  }, [quiz, submitted, attemptsExhausted]);

  useEffect(() => {
    async function loadDraftAttempt() {
      if (!quiz || !currentUser || draftLoaded || attemptsExhausted) return;

      try {
        const draft = await getQuizDraftAttempt({
          quizId: quiz.id,
          studentId: currentUser.uid,
        });

        if (draft) {
          const shouldResume = window.confirm(
            "An unfinished attempt was found. Do you want to resume it?"
          );

          if (shouldResume) {
            if (Array.isArray(draft.answers)) {
              setAnswers(draft.answers as StudentAnswer[]);
            }

            if (Array.isArray(draft.flaggedQuestions)) {
              setFlaggedQuestions(draft.flaggedQuestions as number[]);
            }

            if (typeof draft.currentIndex === "number") {
              setCurrentIndex(draft.currentIndex);
            }

            if (typeof draft.secondsRemaining === "number") {
              setSecondsRemaining(draft.secondsRemaining);
            }
          }
        }
      } catch (error) {
        console.error("Failed to load draft attempt:", error);
      } finally {
        setDraftLoaded(true);
      }
    }

    loadDraftAttempt();
  }, [quiz, currentUser, draftLoaded, attemptsExhausted]);

  useEffect(() => {
    if (!quiz || !currentUser || submitted || !draftLoaded || attemptsExhausted) return;

    const interval = window.setInterval(async () => {
      try {
        await saveQuizDraftAttempt({
          quizId: quiz.id,
          studentId: currentUser.uid,
          data: {
            quizTitle: quiz.title,
            studentName: currentUser.email || "Student",
            answers,
            flaggedQuestions,
            currentIndex,
            secondsRemaining,
            startedAt,
            completed: false,
          },
        });
      } catch (error) {
        console.error("Failed to autosave draft attempt:", error);
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [
    quiz,
    currentUser,
    submitted,
    draftLoaded,
    answers,
    flaggedQuestions,
    currentIndex,
    secondsRemaining,
    startedAt,
    attemptsExhausted,
  ]);
  
  const quizQuestions = useMemo(() => {
    if (!quiz) return [];

    return quiz.questions
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((ref) => {
        const question = linkedQuestions.find(
          (item) => item.id === ref.questionId
        );

        return {
          ref,
          question,
        };
      })
      .filter((item) => item.question) as {
      ref: Quiz["questions"][number];
      question: Question;
    }[];
  }, [quiz, linkedQuestions]);

  const currentQuestion = quizQuestions[currentIndex];

  const markedAnswers = useMemo<QuizAnswer[]>(() => {
    return quizQuestions.map((item) => {
      const answer = answers.find(
        (studentAnswer) => studentAnswer.questionId === item.question.id
      );

      const isCorrect = answer
        ? checkAnswer(item.question, answer.answer)
        : false;

      return {
        questionId: item.question.id,
        selectedOptionId: answer?.answer,
        textAnswer: answer?.answer,
        isCorrect,
        marksAwarded: isCorrect ? item.ref.marks : 0,
      };
    });
  }, [answers, quizQuestions]);

  const score = markedAnswers.reduce(
    (sum, answer) => sum + answer.marksAwarded,
    0
  );

  const totalMarks =
    quiz?.totalMarks ||
    quizQuestions.reduce((sum, item) => sum + item.ref.marks, 0);

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;

  const passed = quiz ? percentage >= quiz.passMark : false;

  const answeredIndexes = quizQuestions
    .map((item, index) => (isAnswered(item.question.id) ? index : -1))
    .filter((index) => index !== -1);

  const hoursRemaining = Math.floor(secondsRemaining / 3600);
  const minutesPart = Math.floor((secondsRemaining % 3600) / 60);
  const secondsPart = secondsRemaining % 60;

  const formattedTime = `${String(hoursRemaining).padStart(2, "0")}:${String(
    minutesPart
  ).padStart(2, "0")}:${String(secondsPart).padStart(2, "0")}`;

  const minutesRemaining = Math.floor(secondsRemaining / 60);

  const progressPercentage =
    quizQuestions.length > 0
      ? Math.round((answers.length / quizQuestions.length) * 100)
      : 0;

  const timerClass =
    secondsRemaining <= 300
      ? "bg-red-50 text-red-700"
      : secondsRemaining <= 600
      ? "bg-amber-50 text-amber-700"
      : "bg-blue-50 text-blue-800";

  function selectAnswer(questionId: string, answer: string) {
    if (submitted) return;

    setAnswers((current) => {
      const exists = current.some((item) => item.questionId === questionId);

      if (exists) {
        return current.map((item) =>
          item.questionId === questionId ? { ...item, answer } : item
        );
      }

      return [...current, { questionId, answer }];
    });
  }

  function getAnswer(questionId: string) {
    return answers.find((item) => item.questionId === questionId)?.answer || "";
  }

  function isAnswered(questionId: string) {
    return answers.some((item) => item.questionId === questionId);
  }

  function toggleFlag(index: number) {
    setFlaggedQuestions((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  function checkAnswer(question: Question, answer: string) {
    const correctAnswer = question.correctAnswer?.trim().toLowerCase() || "";
    const selectedAnswer = answer.trim().toLowerCase();

    const selectedOption = question.options?.find(
      (option) => option.label.toLowerCase() === selectedAnswer
    );

    return (
      selectedAnswer === correctAnswer ||
      selectedOption?.text.trim().toLowerCase() === correctAnswer
    );
  }

  async function requestExtraAttempt() {
    if (!quiz) return;
    try {
      setRequestingReattempt(true);
      const result = await requestStudentQuizReattempt({ quizId: quiz.id });
      setReattemptRequestMessage(result.message);
    } catch (error) {
      console.error("Failed to request an extra attempt:", error);
      setReattemptRequestMessage(error instanceof Error ? error.message : "Unable to send the request to your tutor.");
    } finally {
      setRequestingReattempt(false);
    }
  }

  async function handleSubmit(autoSubmit = false) {
    if (!quiz || submitted || attemptsExhausted) return;

    const unanswered = quizQuestions.length - answers.length;

    if (!autoSubmit && unanswered > 0) {
      const proceed = window.confirm(
        `You still have ${unanswered} unanswered question(s). Submit anyway?`
      );

      if (!proceed) return;
    }

    setSavingAttempt(true);

    try {
      if (!currentUser) {
        throw new Error("You must be signed in to submit this assessment.");
      }

      if (attemptUsage && attemptUsage.attemptsRemaining <= 0) {
        throw new Error("You have used all the attempts allowed for this quiz.");
      }

      const durationSeconds = Math.max(
        0,
        Math.floor((new Date().getTime() - startedAt.getTime()) / 1000)
      );

      const submissionResult = await createQuizAttempt({
        id: "",
        quizId: quiz.id,
        quizTitle: quiz.title,
        studentId: currentUser.uid,
        studentName: currentUser.email || "Student",
        startedAt,
        submittedAt: new Date(),
        durationSeconds,
        answers: markedAnswers,
        score,
        totalMarks,
        percentage,
        passed,
        completed: true,
      });

      setAttemptUsage(submissionResult);
      if (submissionResult.aiMarking?.aiMarked) {
        setAiFinalResult(submissionResult.aiMarking);
      }

      // The completed attempt is already safely stored at this point.
      // Draft cleanup and fullscreen exit are non-critical and must not
      // produce a false "failed to save" message after a successful write.
      try {
        await deleteQuizDraftAttempt({
          quizId: quiz.id,
          studentId: currentUser.uid,
        });
      } catch (cleanupError) {
        console.warn("Attempt saved, but draft cleanup failed:", cleanupError);
      }

      try {
        if (document.fullscreenElement) {
          await document.exitFullscreen();
        }
      } catch (fullscreenError) {
        console.warn("Attempt saved, but fullscreen exit failed:", fullscreenError);
      }

      const finalPassed = submissionResult.aiMarking?.passed ?? passed;
      setSubmitted(true);
      if (finalPassed) {
        try {
          if (quiz.lessonId) {
            await completeLessonLearning(quiz.lessonId);
          }
          const destination = await getStudentPostQuizDestination(quiz.id);
          navigate(destination.path, { replace: true });
          return;
        } catch (destinationError) {
          console.warn("Assessment passed, but the next learning destination could not be resolved.", destinationError);
          if (quiz.moduleId) {
            navigate(`/lesson/${encodeURIComponent(quiz.moduleId)}`, { replace: true });
            return;
          }
        }
      }
    } catch (error) {
      console.error("Failed to save quiz attempt:", error);
      alert(
        error instanceof Error
          ? `Failed to save quiz attempt: ${error.message}`
          : "Failed to save quiz attempt. Please check your connection and try again."
      );
    } finally {
      setSavingAttempt(false);
    }
  }

  submitHandlerRef.current = handleSubmit;

  if (loadingQuiz || questionsLoading || attemptUsageLoading) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl">
          <Card>Loading quiz...</Card>
        </div>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl">
          <Card>Quiz not found.</Card>
        </div>
      </main>
    );
  }

  if (attemptsExhausted && !submitted) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-3xl">
          <Card className="text-center">
            <h1 className="text-3xl font-bold text-slate-950">Quiz Attempt Limit Reached</h1>
            <p className="mt-4 text-lg text-slate-700">You have used all the attempts allowed for this quiz.</p>
            <div className="mx-auto mt-6 grid max-w-xl gap-3 rounded-2xl bg-slate-50 p-5 text-left md:grid-cols-3">
              <p><span className="block text-sm text-slate-500">Attempts used</span><strong>{attemptUsage?.attemptsUsed ?? 0}</strong></p>
              <p><span className="block text-sm text-slate-500">Maximum attempts</span><strong>{attemptUsage?.maximumAttempts ?? Math.max(1, quiz.attemptsAllowed ?? 1)}</strong></p>
              <p><span className="block text-sm text-slate-500">Attempts remaining</span><strong>0</strong></p>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button disabled={requestingReattempt} onClick={() => void requestExtraAttempt()}>
                {requestingReattempt ? "Sending Request..." : "Ask Tutor for an Extra Attempt"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/assessments")}>Back to Assessments</Button>
            </div>
            {reattemptRequestMessage && (
              <p className="mx-auto mt-4 max-w-xl rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">
                {reattemptRequestMessage}
              </p>
            )}
          </Card>
        </div>
      </main>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl">
          <Card>This quiz has no valid questions attached.</Card>
        </div>
      </main>
    );
  }

  const displayedScore = aiFinalResult?.finalScore ?? score;
  const displayedPercentage = aiFinalResult?.finalPercentage ?? percentage;
  const displayedPassed = aiFinalResult?.passed ?? passed;

  if (submitted && !reviewMode) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl">
          <Card className="text-center">
            <h1 className="text-3xl font-bold text-slate-950">
              Quiz Submitted
            </h1>

            <p className="mt-4 text-6xl font-bold text-blue-700">
              {displayedPercentage}%
            </p>

            <p className="mt-3 text-xl font-semibold">
              Score: {displayedScore}/{totalMarks}
            </p>

            <p
              className={`mt-3 text-lg font-bold ${
                displayedPassed ? "text-green-700" : "text-red-700"
              }`}
            >
              {displayedPassed ? "Passed" : "Not Passed"}
            </p>

            {aiFinalResult && (
              <div className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left text-sm text-blue-900">
                <strong>AI-assisted marking was applied to essay/short-answer responses.</strong>
                <p className="mt-1">
                  {aiFinalResult.needsTutorReview
                    ? "One or more answers were flagged for tutor review. The tutor can override AI marks before results are formally released."
                    : "The AI marks remain reviewable by the tutor before formal release."}
                </p>
              </div>
            )}
            <div className="mt-6 grid gap-3 rounded-2xl bg-slate-50 p-5 text-left text-sm text-slate-700 md:grid-cols-2">
              <p>Questions: {quizQuestions.length}</p>
              <p>Answered: {answers.length}</p>
              <p>Unanswered: {quizQuestions.length - answers.length}</p>
              <p>Flagged: {flaggedQuestions.length}</p>
              <p>Correct: {markedAnswers.filter((answer) => answer.isCorrect).length}</p>
              <p>Wrong: {markedAnswers.filter((answer) => !answer.isCorrect).length}</p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button onClick={() => navigate("/assessments")}>
                Back to Assessments
              </Button>

              <Button variant="outline" onClick={() => setReviewMode(true)}>
                Review Answers
              </Button>
              {!displayedPassed && attemptUsage?.attemptsRemaining === 0 && (
                <Button disabled={requestingReattempt} onClick={() => void requestExtraAttempt()}>
                  {requestingReattempt ? "Sending Request..." : "Ask Tutor for an Extra Attempt"}
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {attemptUsage && (
          <Card>
            <div className="grid gap-3 text-sm text-slate-700 md:grid-cols-3">
              <p><span className="block text-slate-500">Attempts used</span><strong>{attemptUsage.attemptsUsed}</strong></p>
              <p><span className="block text-slate-500">Maximum attempts</span><strong>{attemptUsage.maximumAttempts}</strong></p>
              <p><span className="block text-slate-500">Attempts remaining</span><strong>{attemptUsage.attemptsRemaining}</strong></p>
            </div>
          </Card>
        )}

        <QuizHeader
          title={quiz.title}
          totalQuestions={quizQuestions.length}
          currentQuestion={currentIndex + 1}
          minutesRemaining={minutesRemaining}
        />

        <Card>
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
              <span>
                Progress: {answers.length}/{quizQuestions.length} answered
              </span>

              <span>{progressPercentage}%</span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-blue-700 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <Card>
              <div className="mb-6 flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700">
                    Question {currentIndex + 1} of {quizQuestions.length}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {currentQuestion.ref.marks} mark(s)
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div
                    className={`rounded-xl px-4 py-3 text-sm font-semibold ${timerClass}`}
                  >
                    Time: {formattedTime}
                  </div>

                  {!submitted && (
                    <Button
                      variant={
                        flaggedQuestions.includes(currentIndex)
                          ? "secondary"
                          : "outline"
                      }
                      onClick={() => toggleFlag(currentIndex)}
                    >
                      <Flag size={16} />
                      {flaggedQuestions.includes(currentIndex)
                        ? "Flagged"
                        : "Flag"}
                    </Button>
                  )}
                </div>
              </div>

              <QuestionCard
                question={currentQuestion.question}
                answer={getAnswer(currentQuestion.question.id)}
                onAnswer={(answer) =>
                  selectAnswer(currentQuestion.question.id, answer)
                }
                disabled={submitted}
              />

              {submitted && reviewMode && (
                <ReviewFeedback
                  question={currentQuestion.question}
                  selectedAnswer={getAnswer(currentQuestion.question.id)}
                  isCorrect={checkAnswer(
                    currentQuestion.question,
                    getAnswer(currentQuestion.question.id)
                  )}
                />
              )}

              <div className="mt-8">
                <QuizNavigation
                  hasPrevious={currentIndex > 0}
                  hasNext={currentIndex < quizQuestions.length - 1}
                  onPrevious={() =>
                    setCurrentIndex((index) => Math.max(index - 1, 0))
                  }
                  onNext={() =>
                    setCurrentIndex((index) =>
                      Math.min(index + 1, quizQuestions.length - 1)
                    )
                  }
                  onSubmit={() => handleSubmit(false)}
                />
              </div>
            </Card>
          </div>

          <Card>
            <QuestionPalette
              total={quizQuestions.length}
              current={currentIndex}
              answered={answeredIndexes}
              flagged={flaggedQuestions}
              onSelect={setCurrentIndex}
            />

            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p>Answered: {answers.length}</p>
              <p>Unanswered: {quizQuestions.length - answers.length}</p>
              <p>Flagged: {flaggedQuestions.length}</p>
              <p>Total Marks: {totalMarks}</p>
              <p>Pass Mark: {quiz.passMark}%</p>
            </div>

            <Button
              className="mt-4 w-full"
              variant="outline"
              onClick={() => {
                const firstUnansweredIndex = quizQuestions.findIndex(
                  (item) => !isAnswered(item.question.id)
                );

                if (firstUnansweredIndex >= 0) {
                  setCurrentIndex(firstUnansweredIndex);
                }
              }}
            >
              First Unanswered
            </Button>

            {!submitted ? (
              <Button
                className="mt-3 w-full"
                disabled={savingAttempt || attemptsExhausted}
                onClick={() => handleSubmit(false)}
              >
                {savingAttempt ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button
                className="mt-3 w-full"
                variant="outline"
                onClick={() => setReviewMode(false)}
              >
                <RotateCcw size={16} />
                Back to Results
              </Button>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}

function ReviewFeedback({
  question,
  selectedAnswer,
  isCorrect,
}: {
  question: Question;
  selectedAnswer: string;
  isCorrect: boolean;
}) {
  return (
    <div
      className={`mt-6 rounded-2xl border p-5 ${
        isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
      }`}
    >
      <p className={`font-bold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
        {isCorrect ? "Correct" : "Incorrect"}
      </p>

      <p className="mt-2 text-sm text-slate-700">
        Your answer:{" "}
        <span className="font-semibold">
          {selectedAnswer || "Not answered"}
        </span>
      </p>

      <p className="mt-1 text-sm text-slate-700">
        Correct answer:{" "}
        <span className="font-semibold">{question.correctAnswer}</span>
      </p>

      {question.explanation && (
        <p className="mt-3 text-sm leading-6 text-slate-700">
          {question.explanation}
        </p>
      )}
    </div>
  );
}




