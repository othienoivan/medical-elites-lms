import { useMemo, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import type { Quiz } from "../../models/Quiz";

type QuizPlayerProps = {
  quiz: Quiz;
  onPassed: (score: number) => void;
};

export default function QuizPlayer({
  quiz,
  onPassed,
}: QuizPlayerProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const score = useMemo(() => {
    let correct = 0;

    quiz.questions.forEach((question) => {
      if (question.correctAnswer && answers[question.id] === question.correctAnswer) {
        correct++;
      }
    });

    return Math.round((correct / quiz.questions.length) * 100);
  }, [answers, quiz]);

  function submitQuiz() {
    setSubmitted(true);

    if (score >= quiz.passMark) {
      onPassed(score);
    }
  }

  return (
    <Card>
      <h2 className="text-2xl font-bold text-slate-900">
        {quiz.title}
      </h2>

      <p className="mt-2 text-slate-600">
        Pass mark:{" "}
        <span className="font-bold text-blue-700">
          {quiz.passMark}%
        </span>
      </p>

      <div className="mt-8 space-y-8">
        {quiz.questions.map((question, index) => (
          <div key={question.id}>
            <h3 className="font-bold text-slate-900">
              {index + 1}. {question.question ?? "Question"}
            </h3>

            <div className="mt-4 space-y-3">
              {(question.options ?? []).map((option) => {
                const selected = answers[question.id] === option;

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setAnswers({
                        ...answers,
                        [question.id]: option,
                      })
                    }
                    className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                      selected
                        ? "border-blue-700 bg-blue-50"
                        : "border-slate-200 hover:border-blue-400"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {submitted && (
              <div
                className={`mt-4 rounded-xl p-4 ${
                  answers[question.id] === question.correctAnswer
                    ? "bg-green-50"
                    : "bg-red-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  {answers[question.id] === question.correctAnswer ? (
                    <CheckCircle2 className="text-green-700" size={20} />
                  ) : (
                    <XCircle className="text-red-700" size={20} />
                  )}

                  <span className="font-semibold">
                    Correct Answer:
                  </span>

                  {question.correctAnswer}
                </div>

                <p className="mt-2 text-sm text-slate-700">
                  {question.explanation}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {!submitted ? (
        <Button className="mt-8 w-full" onClick={submitQuiz}>
          Submit Quiz
        </Button>
      ) : (
        <div className="mt-8 rounded-2xl bg-slate-100 p-6 text-center">
          <h3 className="text-3xl font-bold">
            {score}%
          </h3>

          <p className="mt-2">
            {score >= quiz.passMark
              ? "🎉 Congratulations! You passed."
              : `You need ${quiz.passMark}% to unlock the next module.`}
          </p>
        </div>
      )}
    </Card>
  );
}