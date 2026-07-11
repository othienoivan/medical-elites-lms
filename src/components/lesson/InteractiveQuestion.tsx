import { useState } from "react";
import type { LessonBlock } from "../../models/LessonBlock";

type Props = {
  block: LessonBlock;
};

export default function InteractiveQuestion({ block }: Props) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const questionType = String(block.metadata?.questionType || "mcq");
  const correctAnswer = String(block.metadata?.correctAnswer || "").trim();

  const options = [
    { label: "A", value: block.metadata?.optionA as string },
    { label: "B", value: block.metadata?.optionB as string },
    { label: "C", value: block.metadata?.optionC as string },
    { label: "D", value: block.metadata?.optionD as string },
    { label: "E", value: block.metadata?.optionE as string },
  ].filter((option) => option.value);

  const selectedOption = options.find(
    (option) => option.label === selectedAnswer
  );

  const isCorrect =
    selectedAnswer.trim().toLowerCase() === correctAnswer.toLowerCase() ||
    selectedOption?.value?.trim().toLowerCase() === correctAnswer.toLowerCase();

  function handleSubmit() {
    if (!selectedAnswer.trim()) {
      alert("Please select or enter an answer.");
      return;
    }

    setSubmitted(true);
  }

  function isCorrectOption(option: { label: string; value: string }) {
    return (
      correctAnswer.toLowerCase() === option.label.toLowerCase() ||
      correctAnswer.toLowerCase() === option.value.trim().toLowerCase()
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-rose-200 bg-white">
      <div className="bg-rose-50 p-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
          Interactive Question
        </p>

        <h3 className="mt-1 text-2xl font-bold text-rose-950">
          {block.title || "Assessment Question"}
        </h3>

        <p className="mt-2 text-sm font-semibold capitalize text-rose-700">
          Type: {questionType.replace("-", " ")}
        </p>
      </div>

      <div className="space-y-5 p-6">
        <p className="whitespace-pre-line text-lg font-semibold leading-8 text-slate-800">
          {block.metadata?.questionText as string}
        </p>

        {["mcq", "emq"].includes(questionType) && (
          <div className="space-y-3">
            {options.map((option) => {
              const selected = selectedAnswer === option.label;
              const correct = submitted && isCorrectOption(option);
              const wrong = submitted && selected && !isCorrectOption(option);

              return (
                <button
                  key={option.label}
                  type="button"
                  disabled={submitted}
                  onClick={() => setSelectedAnswer(option.label)}
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    correct
                      ? "border-green-500 bg-green-50"
                      : wrong
                        ? "border-red-500 bg-red-50"
                        : selected
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-slate-50 hover:bg-white"
                  }`}
                >
                  <span className="font-bold">{option.label}.</span>{" "}
                  {option.value}
                </button>
              );
            })}
          </div>
        )}

        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Submit Answer
          </button>
        ) : (
          <div
            className={`rounded-2xl p-5 ${
              isCorrect ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <p
              className={`font-bold ${
                isCorrect ? "text-green-800" : "text-red-800"
              }`}
            >
              {isCorrect ? "Correct" : "Incorrect"}
            </p>

            <p className="mt-2 text-slate-700">
              Correct answer:{" "}
              <span className="font-semibold">{correctAnswer}</span>
            </p>

            {block.metadata?.explanation && (
              <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">
                {block.metadata.explanation as string}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}