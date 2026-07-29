import { HelpCircle, Layers } from "lucide-react";

import Card from "../ui/Card";
import QuestionPicker from "./QuestionPicker";
import SelectedQuestionsPanel from "./SelectedQuestionsPanel";
import type {
  ExaminationQuestionRef,
  ExaminationSection,
} from "../../models/Examination";
import type { Question } from "../../models/Question";

type Props = {
  section: ExaminationSection;
  onAddQuestion: (question: Question) => void;
  onRemoveQuestion: (questionId: string) => void;
};

export default function SectionQuestionManager({
  section,
  onAddQuestion,
  onRemoveQuestion,
}: Props) {
  const selectedQuestions: ExaminationQuestionRef[] = section.questions;

  const totalMarks = selectedQuestions.reduce(
    (sum, question) => sum + question.marks,
    0
  );

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Layers className="text-blue-700" size={28} />

              <h2 className="text-2xl font-bold text-slate-950">
                Section Question Manager
              </h2>
            </div>

            <p className="mt-2 text-slate-600">
              Add reusable question bank items to this examination section.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge>{selectedQuestions.length} Question(s)</Badge>
            <Badge>{totalMarks} Mark(s)</Badge>
            <Badge>{formatSectionType(section.type)}</Badge>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <HelpCircle className="mt-1 text-blue-700" size={22} />

            <div>
              <h3 className="font-bold text-blue-950">{section.title}</h3>

              <p className="mt-1 text-sm leading-6 text-blue-800">
                {section.instructions}
              </p>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuestionPicker
            selectedQuestions={selectedQuestions}
            onAddQuestion={onAddQuestion}
            onRemoveQuestion={onRemoveQuestion}
          />
        </div>

        <div>
          <SelectedQuestionsPanel
            questions={selectedQuestions}
            onRemove={onRemoveQuestion}
          />
        </div>
      </div>
    </div>
  );
}

function formatSectionType(type: string) {
  switch (type) {
    case "mcq":
      return "MCQ";
    case "true-false":
      return "True / False";
    case "short-answer":
      return "Short Answer";
    case "structured":
      return "Structured Questions";
    case "essay":
      return "Essay";
    case "clinical-case":
      return "Clinical Case";
    case "osce":
      return "OSCE";
    case "ospe":
      return "OSPE";
    default:
      return type;
  }
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}