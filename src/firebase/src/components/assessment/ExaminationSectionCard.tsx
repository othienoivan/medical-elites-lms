import {
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import type {
  ExaminationQuestionRef,
  ExaminationSection,
} from "../../models/Examination";

type Props = {
  section: ExaminationSection;
  onEdit: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onManageQuestions: () => void;
};

export default function ExaminationSectionCard({
  section,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onManageQuestions,
}: Props) {
  const totalQuestions = section.questions.length;

  const totalMarks = section.questions.reduce(
    (sum: number, question: ExaminationQuestionRef) => sum + question.marks,
    0
  );

  return (
    <Card className="border-l-4 border-l-blue-700">
      <div className="flex flex-col gap-5 lg:flex-row lg:justify-between">
        <div className="flex flex-1 gap-4">
          <GripVertical size={22} className="mt-1 text-slate-400" />

          <div className="flex-1">
            <div className="flex flex-wrap gap-2">
              <Badge>{formatSectionType(section.type)}</Badge>
              <Badge>Order {section.order}</Badge>
            </div>

            <h2 className="mt-3 text-2xl font-bold text-slate-950">
              {section.title}
            </h2>

            <p className="mt-3 leading-7 text-slate-600">
              {section.instructions}
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>{totalQuestions} Question(s)</Badge>
              <Badge>{totalMarks} Mark(s)</Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:w-72 lg:justify-end">
          <Button variant="outline" onClick={onManageQuestions}>
            Questions
          </Button>

          <Button variant="outline" onClick={onEdit}>
            <Pencil size={16} />
            Edit
          </Button>

          <IconButton label="Duplicate section" onClick={onDuplicate}>
            <Copy size={16} />
          </IconButton>

          <IconButton label="Move section up" onClick={onMoveUp}>
            <ChevronUp size={18} />
          </IconButton>

          <IconButton label="Move section down" onClick={onMoveDown}>
            <ChevronDown size={18} />
          </IconButton>

          <IconButton label="Delete section" onClick={onDelete}>
            <Trash2 size={18} className="text-red-600" />
          </IconButton>
        </div>
      </div>
    </Card>
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

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex items-center justify-center rounded-xl px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
    >
      {children}
    </button>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800">
      {children}
    </span>
  );
}