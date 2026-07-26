import FileUpload from "../upload/FileUpload";
import RichTextEditor from "./RichTextEditor";
import type { LessonBlock } from "../../models/LessonBlock";

type Props = {
  block: LessonBlock;
  onChange: (updatedBlock: LessonBlock) => void;
  onDelete: () => void;
};

export default function LessonBlockRenderer({
  block,
  onChange,
  onDelete,
}: Props) {
  function updateMetadata(key: string, value: string | number) {
    onChange({
      ...block,
      metadata: {
        ...block.metadata,
        [key]: value,
      },
    });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-bold uppercase text-blue-700">
          {block.type}
        </p>

        <button
          type="button"
          onClick={onDelete}
          className="text-sm font-semibold text-red-600 hover:text-red-700"
        >
          Delete
        </button>
      </div>

      {block.type === "heading" && (
        <input
          aria-label="Heading title"
          value={block.title || ""}
          onChange={(e) => onChange({ ...block, title: e.target.value })}
          placeholder="Heading title"
          className="w-full rounded-xl border border-slate-300 px-4 py-3 text-xl font-bold outline-none focus:border-blue-700"
        />
      )}

      {block.type === "objective" && (
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Learning objectives</label>
          <textarea
            aria-label="Learning objectives"
            value={block.content || ""}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            placeholder={"Enter multiple objectives, one per line.\nExplain the concept...\nDemonstrate the procedure...\nApply the guideline..."}
            rows={6}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
          />
          <p className="mt-2 text-xs text-slate-500">Add as many objectives as needed; place each objective on a new line.</p>
        </div>
      )}

      {block.type === "richtext" && (
        <RichTextEditor
          content={block.content || ""}
          onChange={(value) => onChange({ ...block, content: value })}
        />
      )}

      {block.type === "image" && (
        <ResourceUploadBlock
          block={block}
          onChange={onChange}
          folder="images"
          accept="image/*"
          uploadLabel="Upload Image"
          titlePlaceholder="Image title or caption"
        />
      )}

      {block.type === "pdf" && (
        <ResourceUploadBlock
          block={block}
          onChange={onChange}
          folder="pdfs"
          accept=".pdf,application/pdf"
          uploadLabel="Upload PDF"
          titlePlaceholder="PDF title"
        />
      )}

      {block.type === "powerpoint" && (
        <ResourceUploadBlock
          block={block}
          onChange={onChange}
          folder="powerpoints"
          accept=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
          uploadLabel="Upload PowerPoint"
          titlePlaceholder="PowerPoint title"
        />
      )}

      {block.type === "document" && (
        <ResourceUploadBlock
          block={block}
          onChange={onChange}
          folder="documents"
          accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          uploadLabel="Upload Word Document"
          titlePlaceholder="Document title"
        />
      )}

      {block.type === "youtube" && (
        <div className="grid gap-4">
          <MetadataInput
            label="Video Title"
            value={block.title || ""}
            onChange={(value) => onChange({ ...block, title: value })}
          />

          <MetadataInput
            label="YouTube Embed URL"
            value={block.url || ""}
            onChange={(value) => onChange({ ...block, url: value })}
          />
        </div>
      )}

      {block.type === "clinical-case" && (
        <div className="space-y-4">
          <MetadataInput
            label="Clinical Case Title"
            value={block.title || ""}
            onChange={(value) => onChange({ ...block, title: value })}
          />

          {[
            ["chiefComplaint", "Chief Complaint"],
            ["history", "History of Presenting Illness"],
            ["examination", "Physical Examination"],
            ["investigations", "Investigations"],
            ["diagnosis", "Diagnosis"],
            ["management", "Management"],
            ["learningPoints", "Learning Points"],
          ].map(([key, label]) => (
            <MetadataTextarea
              key={key}
              label={label}
              value={(block.metadata?.[key] as string) || ""}
              onChange={(value) => updateMetadata(key, value)}
            />
          ))}
        </div>
      )}

      {block.type === "drug-table" && (
        <div className="space-y-4">
          <MetadataInput
            label="Drug Table Title"
            value={block.title || ""}
            onChange={(value) => onChange({ ...block, title: value })}
          />

          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["drugName", "Drug Name"],
              ["genericName", "Generic Name"],
              ["drugClass", "Drug Class"],
              ["indication", "Indication"],
              ["dose", "Dose"],
              ["route", "Route"],
              ["frequency", "Frequency"],
              ["duration", "Duration"],
            ].map(([key, label]) => (
              <MetadataInput
                key={key}
                label={label}
                value={(block.metadata?.[key] as string) || ""}
                onChange={(value) => updateMetadata(key, value)}
              />
            ))}
          </div>

          {[
            ["contraindications", "Contraindications"],
            ["sideEffects", "Side Effects"],
            ["precautions", "Precautions"],
            ["interactions", "Drug Interactions"],
            ["monitoring", "Monitoring"],
            ["notes", "Additional Notes"],
          ].map(([key, label]) => (
            <MetadataTextarea
              key={key}
              label={label}
              value={(block.metadata?.[key] as string) || ""}
              onChange={(value) => updateMetadata(key, value)}
            />
          ))}
        </div>
      )}

      {block.type === "osce-station" && (
        <div className="space-y-4">
          <MetadataInput
            label="OSCE Station Title"
            value={block.title || ""}
            onChange={(value) => onChange({ ...block, title: value })}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <MetadataInput
              label="Station Name"
              value={(block.metadata?.osceStation as string) || ""}
              onChange={(value) => updateMetadata("osceStation", value)}
            />

            <MetadataInput
              label="Time Allowed"
              value={(block.metadata?.timeAllowed as string) || ""}
              onChange={(value) => updateMetadata("timeAllowed", value)}
            />
          </div>

          <MetadataTextarea
            label="Candidate Instructions"
            value={(block.metadata?.stationInstructions as string) || ""}
            onChange={(value) => updateMetadata("stationInstructions", value)}
          />

          <MetadataTextarea
            label="Equipment Required"
            value={(block.metadata?.equipment as string) || ""}
            onChange={(value) => updateMetadata("equipment", value)}
          />

          <MetadataTextarea
            label="Examiner Checklist"
            value={(block.metadata?.examinerChecklist as string) || ""}
            onChange={(value) => updateMetadata("examinerChecklist", value)}
          />

          <MetadataTextarea
            label="Marking Guide"
            value={(block.metadata?.markingGuide as string) || ""}
            onChange={(value) => updateMetadata("markingGuide", value)}
          />

          <MetadataTextarea
            label="Model Answer"
            value={(block.metadata?.modelAnswer as string) || ""}
            onChange={(value) => updateMetadata("modelAnswer", value)}
          />
        </div>
      )}

      {block.type === "question" && (
        <div className="space-y-4">
          <MetadataInput
            label="Question Title"
            value={block.title || ""}
            onChange={(value) => onChange({ ...block, title: value })}
          />

          <div>
            <label className="mb-2 block font-semibold text-slate-700">
              Question Type
            </label>

            <select
              aria-label="Question Type"
              value={(block.metadata?.questionType as string) || "mcq"}
              onChange={(e) => updateMetadata("questionType", e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
            >
              <option value="mcq">Single Best Answer / MCQ</option>
              <option value="true-false">True / False</option>
              <option value="short-answer">Short Answer</option>
              <option value="essay">Essay</option>
              <option value="emq">Extended Matching Question</option>
            </select>
          </div>

          <MetadataTextarea
            label="Question Text"
            value={(block.metadata?.questionText as string) || ""}
            onChange={(value) => updateMetadata("questionText", value)}
          />

          {["mcq", "emq"].includes(
            ((block.metadata?.questionType as string) || "mcq")
          ) && (
            <div className="grid gap-4 md:grid-cols-2">
              {[
                ["optionA", "Option A"],
                ["optionB", "Option B"],
                ["optionC", "Option C"],
                ["optionD", "Option D"],
                ["optionE", "Option E"],
              ].map(([key, label]) => (
                <MetadataInput
                  key={key}
                  label={label}
                  value={(block.metadata?.[key] as string) || ""}
                  onChange={(value) => updateMetadata(key, value)}
                />
              ))}
            </div>
          )}

          {((block.metadata?.questionType as string) || "mcq") ===
            "true-false" ? (
            <div>
              <label className="mb-2 block font-semibold text-slate-700">
                Correct Answer
              </label>

              <select
                aria-label="Correct Answer"
                value={(block.metadata?.correctAnswer as string) || ""}
                onChange={(e) =>
                  updateMetadata("correctAnswer", e.target.value)
                }
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
              >
                <option value="">Select correct answer</option>
                <option value="True">True</option>
                <option value="False">False</option>
              </select>
            </div>
          ) : (
            <MetadataInput
              label="Correct Answer"
              value={(block.metadata?.correctAnswer as string) || ""}
              onChange={(value) => updateMetadata("correctAnswer", value)}
            />
          )}

          <MetadataInput
            label="Marks"
            value={
              block.metadata?.marks !== undefined
                ? String(block.metadata.marks)
                : ""
            }
            onChange={(value) => updateMetadata("marks", Number(value))}
          />

          <MetadataTextarea
            label="Explanation / Feedback"
            value={(block.metadata?.explanation as string) || ""}
            onChange={(value) => updateMetadata("explanation", value)}
          />
        </div>
      )}

      {block.type === "knowledge-check" && (
        <MetadataTextarea
          label="Knowledge Check"
          value={block.content || ""}
          onChange={(value) => onChange({ ...block, content: value })}
        />
      )}

      {block.type === "quiz" && (
        <MetadataTextarea
          label="Quiz Instructions"
          value={block.content || ""}
          onChange={(value) => onChange({ ...block, content: value })}
        />
      )}

      {block.type === "assignment" && (
        <MetadataTextarea
          label="Assignment Instructions"
          value={block.content || ""}
          onChange={(value) => onChange({ ...block, content: value })}
        />
      )}
    </div>
  );
}

function ResourceUploadBlock({
  block,
  onChange,
  folder,
  accept,
  uploadLabel,
  titlePlaceholder,
  requirePdfPreview = false,
}: {
  block: LessonBlock;
  onChange: (updatedBlock: LessonBlock) => void;
  folder: "images" | "pdfs" | "powerpoints" | "documents";
  accept: string;
  uploadLabel: string;
  titlePlaceholder: string;
  requirePdfPreview?: boolean;
}) {
  return (
    <div className="grid gap-4">
      <MetadataInput
        label={titlePlaceholder}
        value={block.title || ""}
        onChange={(value) => onChange({ ...block, title: value })}
      />

      <FileUpload
        folder={folder}
        accept={accept}
        label={uploadLabel}
        onUploaded={(file) =>
          onChange({
            ...block,
            url: file.downloadUrl,
            metadata: {
              ...block.metadata,
              fileName: file.fileName,
              filePath: file.filePath,
              contentType: file.contentType,
              size: file.size,
            },
          })
        }
      />

      {requirePdfPreview && (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <p className="font-semibold text-blue-950">Browser preview PDF</p>
          <p className="mt-1 text-sm leading-6 text-blue-800">
            A PDF preview is generated automatically after upload. You may still
            upload a manual PDF replacement when a lecturer needs a specially
            formatted preview.
          </p>
          <div className="mt-4">
            <FileUpload
              folder="pdfs"
              accept=".pdf,application/pdf"
              label={block.metadata?.previewPdfUrl ? "Replace PDF Preview" : "Upload PDF Preview"}
              onUploaded={(file) =>
                onChange({
                  ...block,
                  metadata: {
                    ...block.metadata,
                    previewPdfUrl: file.downloadUrl,
                    previewPdfFileName: file.fileName,
                    previewPdfFilePath: file.filePath,
                  },
                })
              }
            />
          </div>
          {block.metadata?.previewPdfUrl && (
            <a
              href={block.metadata.previewPdfUrl as string}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block font-semibold text-blue-700 underline"
            >
              Open uploaded PDF preview
            </a>
          )}
        </div>
      )}

      {block.url && block.type === "image" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <img
            src={block.url}
            alt={block.title || "Uploaded lesson image"}
            className="max-h-96 w-full object-contain"
          />
        </div>
      )}

      {block.url && block.type !== "image" && (
        <a
          href={block.url}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-white p-4 font-semibold text-blue-700 underline"
        >
          Open uploaded file
        </a>
      )}
    </div>
  );
}

function MetadataInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>

      <input
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
      />
    </div>
  );
}

function MetadataTextarea({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>

      <textarea
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="min-h-28 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-700"
      />
    </div>
  );
}