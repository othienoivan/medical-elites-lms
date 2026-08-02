import { ClipboardList, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import Input from "../ui/Input";
import useQuestions from "../../hooks/useQuestions";
import type { Question } from "../../models/Question";

type SelectedQuestion = {
  questionId: string;
  marks: number;
};

type Props = {
  selectedQuestions: SelectedQuestion[];
  onAddQuestion: (question: Question) => void;
  onRemoveQuestion: (questionId: string) => void;
};

export default function QuestionPicker({
  selectedQuestions,
  onAddQuestion,
  onRemoveQuestion,
}: Props) {
  const { questions, loading } = useQuestions();
  const [search, setSearch] = useState("");

  const filteredQuestions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return questions.filter((question) => {
      const tags = Array.isArray(question.tags) ? question.tags : [];

      return (
        (question.questionText ?? "").toLowerCase().includes(keyword) ||
        (question.topic ?? "").toLowerCase().includes(keyword) ||
        (question.type ?? "").toLowerCase().includes(keyword) ||
        (question.difficulty ?? "").toLowerCase().includes(keyword) ||
        (question.bloomLevel ?? "").toLowerCase().includes(keyword) ||
        tags.some((tag) => (tag ?? "").toLowerCase().includes(keyword))
      );
    });
  }, [questions, search]);

  function isSelected(questionId: string) {
    if (!questionId) return false;

    return selectedQuestions.some(
      (item) => Boolean(item.questionId) && item.questionId === questionId
    );
  }

  return (
    <Card>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <ClipboardList className="text-blue-700" size={28} />

            <h2 className="text-2xl font-bold text-slate-950">
              Question Bank
            </h2>
          </div>

          <p className="mt-2 text-slate-600">
            Search and select reusable questions for this assessment.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge>{questions.length} Available</Badge>
          <Badge>{selectedQuestions.length} Selected</Badge>
        </div>
      </div>

      <div className="relative mt-5">
        <Search size={18} className="absolute left-4 top-4 text-slate-400" />

        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by topic, type, difficulty, Bloom level, tag or question text..."
          className="pl-11"
        />
      </div>

      <div className="mt-5 space-y-3">
        {loading ? (
          <p className="text-slate-600">Loading questions...</p>
        ) : filteredQuestions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
            No questions found. Try another search term or create new questions
            first.
          </div>
        ) : (
          filteredQuestions.map((question) => {
            const selected = isSelected(question.id);

            return (
              <div
                key={question.id}
                className={`rounded-2xl border p-4 transition ${
                  selected
                    ? "border-blue-300 bg-blue-50"
                    : "border-slate-200 bg-slate-50 hover:bg-white"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      <Badge>{question.topic}</Badge>
                      <Badge>{question.type}</Badge>
                      <Badge>{question.difficulty}</Badge>
                      <Badge>{question.bloomLevel}</Badge>
                      <Badge>{question.marks} mark(s)</Badge>
                    </div>

                    <p className="mt-4 font-semibold leading-7 text-slate-950">
                      {question.questionText}
                    </p>

                    {question.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {question.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {selected ? (
                    <Button
                      variant="outline"
                      onClick={() => onRemoveQuestion(question.id)}
                    >
                      <Trash2 size={16} />
                      Remove
                    </Button>
                  ) : (
                    <Button
                      disabled={!question.id}
                      onClick={() => onAddQuestion(question)}
                    >
                      <Plus size={16} />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}