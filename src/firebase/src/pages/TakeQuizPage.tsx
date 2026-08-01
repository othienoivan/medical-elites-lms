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
  saveQuizDraftAttempt,
} from "../firebase/quizAttempts";
import { getQuizById } from "../firebase/quizzes";
import { getQuestionById } from "../firebase/questions";
import useAuth from "../hooks/useAuth";
import type { Question } from "../models/Question";
import type { Quiz } from "../models/Quiz";
import type { QuizAnswer } from "../models/QuizAttempt";

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
  const [draftLoaded, setDraftLoaded] = useState(false);
  const submitHandlerRef = useRef<(autoSubmit?: boolean) => Promise<void>>(
    async () => undefined
  );

  useEffect(() => {
    async function loadQuiz() {
      if (!quizId) return;

      try {
        setLoadingQuiz(true);

        const data = await getQuizById(quizId);

        setQuiz(data);

        if (data) {
          const embeddedQuestions = data.questions
            .map((ref) => toEmbeddedQuestion(ref, data))
            .filter((question): question is Question => Boolean(question));

          if (embeddedQuestions.length === data.questions.length) {
            setLinkedQuestions(embeddedQuestions);
          } else {
            const loaded = await Promise.all(
              data.questions.map((ref) => getQuestionById(ref.questionId))
            );
            setLinkedQuestions(
              loaded.filter((question): question is Question => Boolean(question))
            );
          }
        } else {
          setLinkedQuestions([]);
        }

        if (data?.timeLimitMinutes) {
          setSecondsRemaining(data.timeLimitMinutes * 60);
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
    if (!quiz || submitted || secondsRemaining <= 0) return;

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
  }, [quiz, submitted, secondsRemaining]);

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
    if (!quiz || submitted) return;

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
  }, [quiz, submitted]);

  useEffect(() => {
    async function loadDraftAttempt() {
      if (!quiz || !currentUser || draftLoaded) return;

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
  }, [quiz, currentUser, draftLoaded]);
    useEffect(() => {
    if (!quiz || !currentUser || submitted || !draftLoaded) return;

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

    async function handleSubmit(autoSubmit = false) {
    if (!quiz || submitted) return;

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

      const durationSeconds = Math.max(
        0,
        Math.floor((new Date().getTime() - startedAt.getTime()) / 1000)
      );

      await createQuizAttempt({
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

      setSubmitted(true);
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

  if (loadingQuiz || questionsLoading) {
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

  if (quizQuestions.length === 0) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl">
          <Card>This quiz has no valid questions attached.</Card>
        </div>
      </main>
    );
  }

  if (submitted && !reviewMode) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-5xl">
          <Card className="text-center">
            <h1 className="text-3xl font-bold text-slate-950">
              Quiz Submitted
            </h1>

            <p className="mt-4 text-6xl font-bold text-blue-700">
              {percentage}%
            </p>

            <p className="mt-3 text-xl font-semibold">
              Score: {score}/{totalMarks}
            </p>

            <p
              className={`mt-3 text-lg font-bold ${
                passed ? "text-green-700" : "text-red-700"
              }`}
            >
              {passed ? "Passed" : "Not Passed"}
            </p>

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
            </div>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-6">
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
                disabled={savingAttempt}
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
function toEmbeddedQuestion(
  ref: Quiz["questions"][number],
  quiz: Quiz
): Question | null {
  if (!ref.question || !Array.isArray(ref.options) || ref.options.length === 0) {
    return null;
  }

  return {
    id: ref.questionId,
    programmeId: quiz.programmeId,
    programmeTitle: quiz.programmeTitle,
    courseUnitId: quiz.courseUnitId,
    courseUnitTitle: quiz.courseUnitTitle,
    moduleId: quiz.moduleId,
    moduleTitle: quiz.moduleTitle,
    topic: quiz.moduleTitle || quiz.courseUnitTitle || "Assessment",
    type: "mcq",
    difficulty: "medium",
    bloomLevel: "understand",
    questionText: ref.question,
    options: ref.options.map((text, index) => ({
      id: `${ref.questionId}-${index + 1}`,
      label: String.fromCharCode(65 + index),
      text,
    })),
    correctAnswer: ref.correctAnswer || "",
    explanation: ref.explanation || "",
    marks: ref.marks,
    tags: [],
    isPublished: true,
  };
}
