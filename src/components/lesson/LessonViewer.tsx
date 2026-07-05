import type { LessonBlock } from "../../models/LessonBlock";

type Props = {
  blocks: LessonBlock[];
};

export default function LessonViewer({ blocks }: Props) {
  if (blocks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
        No lesson content has been added yet.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {blocks.map((block) => (
        <section key={block.id}>
          {block.type === "heading" && (
            <h2 className="text-3xl font-bold text-slate-950">
              {block.title}
            </h2>
          )}

          {block.type === "objective" && (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
              <p className="font-semibold text-blue-800">
                Learning Objective
              </p>
              <p className="mt-2 text-slate-700">{block.content}</p>
            </div>
          )}

          {block.type === "richtext" && (
            <div
              className="prose max-w-none leading-8 text-slate-700"
              dangerouslySetInnerHTML={{ __html: block.content || "" }}
            />
          )}

          {block.type === "image" && block.url && (
            <figure className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <img
                src={block.url}
                alt={block.title || "Lesson image"}
                className="max-h-[500px] w-full object-contain"
              />

              {block.title && (
                <figcaption className="border-t bg-slate-50 p-4 text-sm text-slate-600">
                  {block.title}
                </figcaption>
              )}
            </figure>
          )}

          {block.type === "youtube" && block.url && (
            <div>
              {block.title && (
                <h3 className="mb-3 text-xl font-bold text-slate-950">
                  {block.title}
                </h3>
              )}

              <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-black">
                <iframe
                  src={block.url}
                  title={block.title || "YouTube video"}
                  className="h-full w-full"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {block.type === "pdf" && block.url && (
            <a
              href={block.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-blue-700 underline"
            >
              View PDF: {block.title || "PDF resource"}
            </a>
          )}

          {block.type === "powerpoint" && block.url && (
            <a
              href={block.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-slate-200 bg-white p-5 font-semibold text-blue-700 underline"
            >
              Download PowerPoint: {block.title || "PowerPoint resource"}
            </a>
          )}

          {block.type === "clinical-case" && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
              <h3 className="text-2xl font-bold text-amber-900">
                {block.title || "Clinical Case"}
              </h3>

              <div className="mt-5 space-y-4">
                <ClinicalCaseField
                  label="Chief Complaint"
                  value={block.metadata?.chiefComplaint as string}
                />
                <ClinicalCaseField
                  label="History of Presenting Illness"
                  value={block.metadata?.history as string}
                />
                <ClinicalCaseField
                  label="Physical Examination"
                  value={block.metadata?.examination as string}
                />
                <ClinicalCaseField
                  label="Investigations"
                  value={block.metadata?.investigations as string}
                />
                <ClinicalCaseField
                  label="Diagnosis"
                  value={block.metadata?.diagnosis as string}
                />
                <ClinicalCaseField
                  label="Management"
                  value={block.metadata?.management as string}
                />
                <ClinicalCaseField
                  label="Learning Points"
                  value={block.metadata?.learningPoints as string}
                />

                {block.content && (
                  <ClinicalCaseField
                    label="Additional Notes"
                    value={block.content}
                  />
                )}
              </div>
            </div>
          )}

          {block.type === "drug-table" && (
            <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white">
              <div className="bg-emerald-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
                  Drug Table
                </p>

                <h3 className="mt-1 text-2xl font-bold text-emerald-950">
                  {block.title ||
                    (block.metadata?.drugName as string) ||
                    "Drug Information"}
                </h3>
              </div>

              <div className="grid gap-4 p-6 md:grid-cols-2">
                <DrugField
                  label="Drug Name"
                  value={block.metadata?.drugName as string}
                />
                <DrugField
                  label="Generic Name"
                  value={block.metadata?.genericName as string}
                />
                <DrugField
                  label="Drug Class"
                  value={block.metadata?.drugClass as string}
                />
                <DrugField
                  label="Indication"
                  value={block.metadata?.indication as string}
                />
                <DrugField label="Dose" value={block.metadata?.dose as string} />
                <DrugField
                  label="Route"
                  value={block.metadata?.route as string}
                />
                <DrugField
                  label="Frequency"
                  value={block.metadata?.frequency as string}
                />
                <DrugField
                  label="Duration"
                  value={block.metadata?.duration as string}
                />
              </div>

              <div className="space-y-4 border-t border-emerald-100 bg-slate-50 p-6">
                <DrugField
                  label="Contraindications"
                  value={block.metadata?.contraindications as string}
                />
                <DrugField
                  label="Side Effects"
                  value={block.metadata?.sideEffects as string}
                />
                <DrugField
                  label="Precautions"
                  value={block.metadata?.precautions as string}
                />
                <DrugField
                  label="Drug Interactions"
                  value={block.metadata?.interactions as string}
                />
                <DrugField
                  label="Monitoring"
                  value={block.metadata?.monitoring as string}
                />
                <DrugField
                  label="Additional Notes"
                  value={block.metadata?.notes as string}
                />

                {block.content && (
                  <DrugField label="Summary" value={block.content} />
                )}
              </div>
            </div>
          )}

          {block.type === "osce-station" && (
            <div className="overflow-hidden rounded-2xl border border-indigo-200 bg-white">
              <div className="bg-indigo-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-indigo-700">
                  OSCE Station
                </p>

                <h3 className="mt-1 text-2xl font-bold text-indigo-950">
                  {block.title ||
                    (block.metadata?.osceStation as string) ||
                    "OSCE Station"}
                </h3>

                {block.metadata?.timeAllowed && (
                  <p className="mt-2 text-sm font-semibold text-indigo-700">
                    Time Allowed: {block.metadata.timeAllowed as string}
                  </p>
                )}
              </div>

              <div className="space-y-4 p-6">
                <OsceField
                  label="Station Name"
                  value={block.metadata?.osceStation as string}
                />

                <OsceField
                  label="Candidate Instructions"
                  value={block.metadata?.stationInstructions as string}
                />

                <OsceField
                  label="Equipment Required"
                  value={block.metadata?.equipment as string}
                />

                <OsceField
                  label="Examiner Checklist"
                  value={block.metadata?.examinerChecklist as string}
                />

                <OsceField
                  label="Marking Guide"
                  value={block.metadata?.markingGuide as string}
                />

                <OsceField
                  label="Model Answer"
                  value={block.metadata?.modelAnswer as string}
                />

                {block.content && (
                  <OsceField label="Additional Notes" value={block.content} />
                )}
              </div>
            </div>
          )}

          {block.type === "question" && (
            <div className="overflow-hidden rounded-2xl border border-rose-200 bg-white">
              <div className="bg-rose-50 p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-rose-700">
                  Question
                </p>

                <h3 className="mt-1 text-2xl font-bold text-rose-950">
                  {block.title || "Assessment Question"}
                </h3>

                {block.metadata?.questionType && (
                  <p className="mt-2 text-sm font-semibold capitalize text-rose-700">
                    Type:{" "}
                    {String(block.metadata.questionType).replace("-", " ")}
                  </p>
                )}
              </div>

              <div className="space-y-4 p-6">
                <QuestionField
                  label="Question Text"
                  value={block.metadata?.questionText as string}
                />

                {["mcq", "emq"].includes(
                  String(block.metadata?.questionType || "mcq")
                ) && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <QuestionOption
                      label="A"
                      value={block.metadata?.optionA as string}
                    />
                    <QuestionOption
                      label="B"
                      value={block.metadata?.optionB as string}
                    />
                    <QuestionOption
                      label="C"
                      value={block.metadata?.optionC as string}
                    />
                    <QuestionOption
                      label="D"
                      value={block.metadata?.optionD as string}
                    />
                    <QuestionOption
                      label="E"
                      value={block.metadata?.optionE as string}
                    />
                  </div>
                )}

                <QuestionField
                  label="Correct Answer"
                  value={block.metadata?.correctAnswer as string}
                />

                {block.metadata?.marks !== undefined && (
                  <QuestionField
                    label="Marks"
                    value={String(block.metadata.marks)}
                  />
                )}

                <QuestionField
                  label="Explanation / Feedback"
                  value={block.metadata?.explanation as string}
                />
              </div>
            </div>
          )}

          {block.type === "knowledge-check" && (
            <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6">
              <h3 className="text-xl font-bold text-purple-900">
                Knowledge Check
              </h3>
              <p className="mt-3 whitespace-pre-line leading-8 text-slate-700">
                {block.content}
              </p>
            </div>
          )}

          {["quiz", "assignment"].includes(block.type) && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h3 className="text-xl font-bold capitalize text-slate-950">
                {block.type.replace("-", " ")}
              </h3>
              <p className="mt-3 whitespace-pre-line leading-8 text-slate-700">
                {block.content}
              </p>
            </div>
          )}
        </section>
      ))}
    </div>
  );
}

function ClinicalCaseField({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) return null;

  return (
    <div className="rounded-xl border border-amber-100 bg-white p-4">
      <p className="font-bold text-amber-900">{label}</p>
      <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function DrugField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-emerald-800">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function OsceField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-indigo-800">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function QuestionField({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="rounded-xl border border-rose-100 bg-rose-50 p-4">
      <p className="text-sm font-bold uppercase tracking-wide text-rose-800">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-line leading-7 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function QuestionOption({ label, value }: { label: string; value?: string }) {
  if (!value) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="font-bold text-slate-900">Option {label}</p>
      <p className="mt-2 whitespace-pre-line text-slate-700">{value}</p>
    </div>
  );
}