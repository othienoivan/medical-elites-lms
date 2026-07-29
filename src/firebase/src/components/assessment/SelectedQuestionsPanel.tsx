import { ClipboardList, GripVertical, Trash2 } from "lucide-react";

import Card from "../ui/Card";
import useQuestions from "../../hooks/useQuestions";
import type { QuizQuestionRef } from "../../models/Quiz";

type Props = {
  questions: QuizQuestionRef[];
  onRemove: (questionId: string) => void;
};

export default function SelectedQuestionsPanel({
  questions,
  onRemove,
}: Props) {
  const { questions: questionBank } = useQuestions();

  const totalMarks = questions.reduce(
    (sum, question) => sum + question.marks,
    0
  );

  return (
    <Card>
      <div className="flex items-start gap-3">
        <ClipboardList className="mt-1 text-blue-700" size={26} />

        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Selected Questions
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Questions currently attached to this assessment.
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
            No questions selected yet.
          </div>
        ) : (
          questions.map((item) => {
            const question = questionBank.find(
              (bankQuestion) => bankQuestion.id === item.questionId
            );

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
              >
                <GripVertical size={18} className="mt-1 text-slate-400" />

                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    <Badge>Q{item.order}</Badge>
                    <Badge>{item.marks} mark(s)</Badge>

                    {question?.type && <Badge>{question.type}</Badge>}
                    {question?.difficulty && <Badge>{question.difficulty}</Badge>}
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">
                    {question?.questionText ?? "Question not found"}
                  </p>
                </div>

                <button
                  type="button"
                  aria-label="Remove selected question"
                  title="Remove selected question"
                  onClick={() => onRemove(item.questionId)}
                  className="rounded-xl p-2 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 size={17} />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-950">
        <div className="flex justify-between">
          <span>Total Questions</span>
          <strong>{questions.length}</strong>
        </div>

        <div className="mt-2 flex justify-between">
          <span>Total Marks</span>
          <strong>{totalMarks}</strong>
        </div>
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800">
      {children}
    </span>
  );
}