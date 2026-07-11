import type { Question } from "../../models/Question";

type Props = {
  question: Question;
  answer: string;
  onAnswer: (answer: string) => void;
  disabled?: boolean;
};

export default function QuestionCard({
  question,
  answer,
  onAnswer,
  disabled = false,
}: Props) {
  return (
    <div>
      <p className="text-sm font-semibold text-blue-700">
        {question.topic}
      </p>

      <h2 className="mt-3 whitespace-pre-line text-2xl font-bold leading-9 text-slate-950">
        {question.questionText}
      </h2>

      {["mcq", "emq"].includes(question.type) && (
        <div className="mt-6 space-y-3">
          {question.options.map((option) => {
            const selected = answer === option.label;

            return (
              <button
                key={option.id}
                type="button"
                disabled={disabled}
                onClick={() => onAnswer(option.label)}
                className={`w-full rounded-xl border p-4 text-left transition ${
                  selected
                    ? "border-blue-700 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:bg-white"
                }`}
              >
                <span className="font-bold">{option.label}.</span>{" "}
                {option.text}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "true-false" && (
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {["True", "False"].map((option) => (
            <button
              key={option}
              type="button"
              disabled={disabled}
              onClick={() => onAnswer(option)}
              className={`rounded-xl border p-4 font-semibold transition ${
                answer === option
                  ? "border-blue-700 bg-blue-50"
                  : "border-slate-200 bg-slate-50 hover:bg-white"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}

      {["short-answer", "essay"].includes(question.type) && (
        <textarea
          value={answer}
          disabled={disabled}
          onChange={(event) => onAnswer(event.target.value)}
          placeholder="Type your answer here..."
          className="mt-6 min-h-40 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
        />
      )}
    </div>
  );
}