import { Clock } from "lucide-react";

type Props = {
  title: string;
  totalQuestions: number;
  currentQuestion: number;
  minutesRemaining: number;
};

export default function QuizHeader({
  title,
  totalQuestions,
  currentQuestion,
  minutesRemaining,
}: Props) {
  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 p-6 text-white">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>

          <p className="mt-2 text-blue-100">
            Question {currentQuestion} of {totalQuestions}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl bg-white/10 px-5 py-3">
          <Clock size={22} />

          <div>
            <p className="text-xs uppercase tracking-wide">
              Time Remaining
            </p>

            <h2 className="text-2xl font-bold">
              {minutesRemaining} min
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}