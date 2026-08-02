import { Plus, X } from "lucide-react";
import {
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import Button from "../ui/Button";
import Card from "../ui/Card";
import ExaminationSectionCard from "./ExaminationSectionCard";
import SectionQuestionManager from "./SectionQuestionManager";
import type {
  ExaminationQuestionRef,
  ExaminationSection,
  ExaminationSectionType,
} from "../../models/Examination";
import type { Question } from "../../models/Question";

type Props = {
  sections: ExaminationSection[];
  setSections: Dispatch<SetStateAction<ExaminationSection[]>>;
};

const sectionTypes: {
  label: string;
  value: ExaminationSectionType;
}[] = [
  { label: "MCQ", value: "mcq" },
  { label: "True / False", value: "true-false" },
  { label: "Short Answer", value: "short-answer" },
  { label: "Structured Questions", value: "structured" },
  { label: "Essay", value: "essay" },
  { label: "Clinical Case", value: "clinical-case" },
  { label: "OSCE", value: "osce" },
  { label: "OSPE", value: "ospe" },
];

export default function SectionBuilder({ sections, setSections }: Props) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const activeSection = sections.find(
    (section) => section.id === activeSectionId
  );

  function calculateSectionMarks(questions: ExaminationQuestionRef[]) {
    return questions.reduce((sum, question) => sum + question.marks, 0);
  }

  function addSection(type: ExaminationSectionType) {
    setSections((current) => {
      const label =
        sectionTypes.find((sectionType) => sectionType.value === type)?.label ||
        "Section";

      const nextOrder = current.length + 1;

      const newSection: ExaminationSection = {
        id: crypto.randomUUID(),
        title: `Section ${String.fromCharCode(64 + nextOrder)}: ${label}`,
        instructions: "Answer all questions in this section.",
        type,
        order: nextOrder,
        questions: [],
        totalMarks: 0,
      };

      return [...current, newSection];
    });
  }

  function deleteSection(sectionId: string) {
    setSections((current) =>
      current
        .filter((section) => section.id !== sectionId)
        .map((section, index) => ({
          ...section,
          order: index + 1,
        }))
    );

    if (activeSectionId === sectionId) {
      setActiveSectionId(null);
    }
  }

  function duplicateSection(section: ExaminationSection) {
    setSections((current) => {
      const copiedQuestions = section.questions.map((question, index) => ({
        ...question,
        id: crypto.randomUUID(),
        order: index + 1,
      }));

      const duplicated: ExaminationSection = {
        ...section,
        id: crypto.randomUUID(),
        title: `${section.title} Copy`,
        order: current.length + 1,
        questions: copiedQuestions,
        totalMarks: calculateSectionMarks(copiedQuestions),
      };

      return [...current, duplicated];
    });
  }

  function moveSection(sectionId: string, direction: "up" | "down") {
    setSections((current) => {
      const index = current.findIndex((section) => section.id === sectionId);

      if (index === -1) return current;

      const targetIndex = direction === "up" ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= current.length) return current;

      const updated = [...current];
      const [removed] = updated.splice(index, 1);

      updated.splice(targetIndex, 0, removed);

      return updated.map((section, orderIndex) => ({
        ...section,
        order: orderIndex + 1,
      }));
    });
  }

  function editSection(section: ExaminationSection) {
    const title = prompt("Section title", section.title);
    if (title === null) return;

    const instructions = prompt("Section instructions", section.instructions);
    if (instructions === null) return;

    setSections((current) =>
      current.map((item) =>
        item.id === section.id
          ? {
              ...item,
              title,
              instructions,
            }
          : item
      )
    );
  }

  function manageQuestions(section: ExaminationSection) {
    setActiveSectionId(section.id);
  }

  function addQuestionToActiveSection(question: Question) {
    if (!activeSectionId) return;

    setSections((current) =>
      current.map((section) => {
        if (section.id !== activeSectionId) return section;

        const alreadyExists = section.questions.some(
          (item) => item.questionId === question.id
        );

        if (alreadyExists) return section;

        const updatedQuestions: ExaminationQuestionRef[] = [
          ...section.questions,
          {
            id: crypto.randomUUID(),
            questionId: question.id,
            order: section.questions.length + 1,
            marks: question.marks,
          },
        ];

        return {
          ...section,
          questions: updatedQuestions,
          totalMarks: calculateSectionMarks(updatedQuestions),
        };
      })
    );
  }

  function removeQuestionFromActiveSection(questionId: string) {
    if (!activeSectionId) return;

    setSections((current) =>
      current.map((section) => {
        if (section.id !== activeSectionId) return section;

        const updatedQuestions = section.questions
          .filter((item) => item.questionId !== questionId)
          .map((item, index) => ({
            ...item,
            order: index + 1,
          }));

        return {
          ...section,
          questions: updatedQuestions,
          totalMarks: calculateSectionMarks(updatedQuestions),
        };
      })
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">
              Examination Sections
            </h2>

            <p className="mt-1 text-slate-600">
              Add and organise sections such as MCQs, structured questions,
              essays, OSCEs and OSPEs.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {sectionTypes.map((sectionType) => (
            <Button
              key={sectionType.value}
              type="button"
              variant="outline"
              onClick={() => addSection(sectionType.value)}
            >
              <Plus size={16} />
              {sectionType.label}
            </Button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {sections.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              No sections added yet. Select a section type above to begin.
            </div>
          ) : (
            sections.map((section) => (
              <ExaminationSectionCard
                key={section.id}
                section={section}
                onEdit={() => editSection(section)}
                onDelete={() => deleteSection(section.id)}
                onDuplicate={() => duplicateSection(section)}
                onMoveUp={() => moveSection(section.id, "up")}
                onMoveDown={() => moveSection(section.id, "down")}
                onManageQuestions={() => manageQuestions(section)}
              />
            ))
          )}
        </div>
      </Card>

      {activeSection && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-blue-950">
                Manage Questions: {activeSection.title}
              </h3>

              <p className="mt-1 text-sm text-blue-800">
                Selected: {activeSection.questions.length} question(s),{" "}
                {activeSection.totalMarks} mark(s)
              </p>
            </div>

            <button
              type="button"
              aria-label="Close question manager"
              title="Close question manager"
              onClick={() => setActiveSectionId(null)}
              className="rounded-xl bg-white p-2 text-slate-600 hover:text-red-600"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          <SectionQuestionManager
            section={activeSection}
            onAddQuestion={addQuestionToActiveSection}
            onRemoveQuestion={removeQuestionFromActiveSection}
          />
        </div>
      )}
    </div>
  );
}