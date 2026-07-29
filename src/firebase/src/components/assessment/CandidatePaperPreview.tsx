import { FileText, GraduationCap, Timer } from "lucide-react";

import Card from "../ui/Card";
import useQuestions from "../../hooks/useQuestions";
import type { Examination } from "../../models/Examination";

type Props = {
  examination: Examination;
};

export default function CandidatePaperPreview({ examination }: Props) {
  const { questions: questionBank } = useQuestions();

  let globalQuestionNumber = 1;

  return (
    <Card>
      <div className="mb-5 flex items-start gap-3">
        <FileText className="mt-1 text-blue-700" size={26} />

        <div>
          <h2 className="text-xl font-bold text-slate-950">
            Candidate Paper Preview
          </h2>

          <p className="mt-1 text-sm text-slate-600">
            Live preview of how the candidate examination paper will appear.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="border-b border-slate-200 pb-6 text-center">
          <h1 className="text-2xl font-bold uppercase text-slate-950">
            {examination.institutionName || "Institution Name"}
          </h1>

          <p className="mt-2 font-semibold uppercase text-slate-700">
            {examination.examinationName || "Examination Name"}
          </p>

          <h2 className="mt-4 text-xl font-bold uppercase text-slate-950">
            {examination.title || "Examination Title"}
          </h2>

          <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm text-slate-600">
            <InfoBadge>
              Academic Year: {examination.academicYear || "N/A"}
            </InfoBadge>

            {examination.semester && <InfoBadge>{examination.semester}</InfoBadge>}

            <InfoBadge>
              <Timer size={14} />
              Time: {examination.timeAllowed || "N/A"}
            </InfoBadge>

            <InfoBadge>
              <GraduationCap size={14} />
              Total Marks: {examination.totalMarks}
            </InfoBadge>
          </div>
        </div>

        {examination.candidateInstructions && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="font-bold text-slate-950">Candidate Instructions</p>

            <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">
              {examination.candidateInstructions}
            </p>
          </div>
        )}

        <div className="mt-8 space-y-8">
          {examination.sections.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-slate-500">
              No examination sections added yet.
            </div>
          ) : (
            examination.sections
              .slice()
              .sort((a, b) => a.order - b.order)
              .map((section, sectionIndex) => {
                const sectionMarks = section.questions.reduce(
                  (sum, question) => sum + question.marks,
                  0
                );

                return (
                  <section key={section.id}>
                    <div className="border-b border-slate-300 pb-3">
                      <h3 className="text-xl font-bold uppercase text-slate-950">
                        {section.title || `Section ${sectionIndex + 1}`}
                      </h3>

                      <p className="mt-1 text-sm font-semibold text-blue-700">
                        {formatSectionType(section.type)} · {sectionMarks} marks
                      </p>

                      {section.instructions && (
                        <p className="mt-2 whitespace-pre-line text-slate-700">
                          {section.instructions}
                        </p>
                      )}
                    </div>

                    <div className="mt-5 space-y-5">
                      {section.questions.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          No questions selected for this section.
                        </p>
                      ) : (
                        section.questions
                          .slice()
                          .sort((a, b) => a.order - b.order)
                          .map((questionRef) => {
                            const questionNumber = globalQuestionNumber++;

                            const question = questionBank.find(
                              (item) => item.id === questionRef.questionId
                            );

                            return (
                              <div key={questionRef.id} className="leading-7">
                                <p className="font-semibold text-slate-950">
                                  {questionNumber}.{" "}
                                  {question?.questionText ||
                                    "Question not found"}
                                  <span className="ml-2 text-sm text-slate-500">
                                    ({questionRef.marks} marks)
                                  </span>
                                </p>

                                {(question?.type === "mcq" ||
                                  question?.type === "emq") &&
                                  question.options.length > 0 && (
                                    <div className="mt-2 space-y-1 pl-6 text-slate-700">
                                      {question.options.map((option) => (
                                        <p key={option.id}>
                                          {option.label}. {option.text}
                                        </p>
                                      ))}
                                    </div>
                                  )}

                                {["short-answer", "essay"].includes(
                                  question?.type || ""
                                ) && (
                                  <div className="mt-3 rounded-lg border border-dashed border-slate-300 p-4 text-sm text-slate-400">
                                    Answer space
                                  </div>
                                )}
                              </div>
                            );
                          })
                      )}
                    </div>
                  </section>
                );
              })
          )}
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

function InfoBadge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
      {children}
    </span>
  );
}