import { useEffect, useState } from "react";
import FileUpload from "../upload/FileUpload";
import RichTextEditor from "./RichTextEditor";
import type { LessonBlock } from "../../models/LessonBlock";
import {
  waitForPowerPointHtmlConversion,
  type PowerPointHtmlFormat,
} from "../../firebase/powerPointHtmlConversion";
import { getLessonResourceAccessUrl } from "../../firebase/lessonResourceAccess";

type Props = {
  block: LessonBlock;
  onChange: (updatedBlock: LessonBlock) => void;
  onDelete: () => void;
  lessonId?: string;
  courseUnitId?: string;
};

export default function LessonBlockRenderer({
  block,
  onChange,
  onDelete,
  lessonId,
  courseUnitId,
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

      {block.type === "html5" && (
        <Html5LessonEditor
          block={block}
          onChange={onChange}
          lessonId={lessonId}
          courseUnitId={courseUnitId}
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

function Html5LessonEditor({
  block,
  onChange,
  lessonId,
  courseUnitId,
}: {
  block: LessonBlock;
  onChange: (updatedBlock: LessonBlock) => void;
  lessonId?: string;
  courseUnitId?: string;
}) {
  const initialSource = String(block.metadata?.htmlSourceType || "html") as "html" | "powerpoint";
  const initialFormat = String(block.metadata?.htmlConversionFormat || "self-contained-html5") as PowerPointHtmlFormat;
  const [sourceType, setSourceType] = useState<"html" | "powerpoint">(initialSource);
  const [format, setFormat] = useState<PowerPointHtmlFormat>(initialFormat);
  const [converting, setConverting] = useState(false);
  const [conversionMessage, setConversionMessage] = useState("");
  const [securePreviewUrl, setSecurePreviewUrl] = useState("");

  useEffect(() => {
    const filePath = String(block.metadata?.filePath || "").trim();
    if (!filePath || String(block.metadata?.htmlConversionStatus || "") !== "ready") {
      setSecurePreviewUrl("");
      return;
    }
    let cancelled = false;
    void getLessonResourceAccessUrl({ filePath, lessonId, courseUnitId, disposition: "inline" })
      .then((url) => { if (!cancelled) setSecurePreviewUrl(url); })
      .catch((error) => console.warn("Secure HTML conversion preview could not be prepared:", error));
    return () => { cancelled = true; };
  }, [block.metadata?.filePath, block.metadata?.htmlConversionStatus, courseUnitId, lessonId]);

  function chooseSource(next: "html" | "powerpoint") {
    setSourceType(next);
    onChange({
      ...block,
      metadata: {
        ...block.metadata,
        htmlSourceType: next,
      },
    });
  }

  function chooseFormat(next: PowerPointHtmlFormat) {
    setFormat(next);
    onChange({
      ...block,
      metadata: {
        ...block.metadata,
        htmlSourceType: "powerpoint",
        htmlConversionFormat: next,
      },
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-slate-700">HTML/CSS learning block</label>
        <p className="mt-1 text-xs text-slate-500">
          Add existing HTML, or upload a PowerPoint and let Medical Elites convert it into an HTML lesson.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => chooseSource("html")}
          className={`rounded-2xl border p-4 text-left ${sourceType === "html" ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white"}`}
        >
          <span className="font-bold text-slate-950">Existing HTML / CSS</span>
          <span className="mt-1 block text-xs text-slate-600">Paste HTML or upload an existing .html/.htm file.</span>
        </button>
        <button
          type="button"
          onClick={() => chooseSource("powerpoint")}
          className={`rounded-2xl border p-4 text-left ${sourceType === "powerpoint" ? "border-blue-700 bg-blue-50" : "border-slate-200 bg-white"}`}
        >
          <span className="font-bold text-slate-950">Convert PowerPoint to HTML</span>
          <span className="mt-1 block text-xs text-slate-600">Upload .pptx, choose a presentation format, preview, then save.</span>
        </button>
      </div>

      {sourceType === "html" ? (
        <div className="space-y-3">
          <textarea
            value={block.content || ""}
            onChange={(e) => onChange({ ...block, content: e.target.value })}
            placeholder="Paste a complete HTML document, including <style> blocks. Scripts run only inside the sandboxed lesson frame."
            rows={14}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 font-mono text-sm outline-none focus:border-blue-700"
          />
          <p className="text-xs text-slate-500">
            Existing HTML is isolated in a sandboxed frame when students view the lesson.
          </p>
          <ResourceUploadBlock
            block={block}
            onChange={(updated) => onChange({
              ...updated,
              metadata: { ...updated.metadata, htmlSourceType: "html" },
            })}
            folder="html5"
            accept=".html,.htm,text/html"
            uploadLabel="Upload HTML5 file5 file"
            titlePlaceholder="Interactive lesson title"
          />
        </div>
      ) : (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          <MetadataInput
            label="Interactive lesson title"
            value={block.title || ""}
            onChange={(value) => onChange({ ...block, title: value })}
          />

          <div>
            <p className="mb-2 text-sm font-semibold text-slate-700">Choose HTML output format</p>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => chooseFormat("html-package")}
                className={`rounded-xl border p-4 text-left ${format === "html-package" ? "border-blue-700 bg-blue-50" : "border-slate-200"}`}
              >
                <strong className="block text-slate-950">1. HTML Package</strong>
                <span className="mt-1 block text-xs text-slate-600">
                  Highest slide fidelity. Slides are rendered as separate optimized image assets with an HTML viewer.
                </span>
              </button>
              <button
                type="button"
                onClick={() => chooseFormat("self-contained-html5")}
                className={`rounded-xl border p-4 text-left ${format === "self-contained-html5" ? "border-blue-700 bg-blue-50" : "border-slate-200"}`}
              >
                <strong className="block text-slate-950">2. Self-contained HTML5</strong>
                <span className="mt-1 block text-xs text-slate-600">
                  Recommended. One portable HTML file with embedded slide images and presentation controls.
                </span>
              </button>
            </div>
          </div>

          <FileUpload
            folder="powerpoints"
            accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            label={converting ? "Conversion in progressâ€¦" : "Upload PowerPoint (.pptx) and convert"}
            customMetadata={{
              htmlConversionFormat: format,
              ...(lessonId ? { lessonId } : {}),
              ...(courseUnitId ? { courseUnitId } : {}),
              lessonBlockId: block.id,
            }}
            onUploaded={async (file) => {
              setConverting(true);
              setConversionMessage("PowerPoint uploaded. Converting slides to HTMLâ€¦");
              onChange({
                ...block,
                content: "",
                metadata: {
                  ...block.metadata,
                  htmlSourceType: "powerpoint",
                  htmlConversionFormat: format,
                  htmlConversionStatus: "processing",
                  sourcePowerPointName: file.fileName,
                  sourcePowerPointPath: file.filePath,
                },
              });
              try {
                const converted = await waitForPowerPointHtmlConversion({
                  sourcePath: file.filePath,
                  format,
                });
                onChange({
                  ...block,
                  content: "",
                  url: converted.downloadUrl,
                  metadata: {
                    ...block.metadata,
                    htmlSourceType: "powerpoint",
                    htmlConversionFormat: format,
                    htmlConversionStatus: "ready",
                    sourcePowerPointName: file.fileName,
                    sourcePowerPointPath: file.filePath,
                    fileName: `${file.fileName.replace(/\.pptx$/i, "")}.html`,
                    filePath: converted.outputPath,
                    contentType: "text/html",
                  },
                });
                try {
                  const accessUrl = await getLessonResourceAccessUrl({
                    filePath: converted.outputPath,
                    lessonId,
                    courseUnitId,
                    disposition: "inline",
                  });
                  setSecurePreviewUrl(accessUrl);
                } catch (accessError) {
                  console.warn("Converted lesson is ready but secure preview authorization is still initializing:", accessError);
                }
                setConversionMessage("Conversion complete. Use Preview to inspect the HTML lesson before saving.");
              } catch (error) {
                console.error("PowerPoint HTML conversion failed:", error);
                setConversionMessage(error instanceof Error ? error.message : "PowerPoint conversion failed.");
                onChange({
                  ...block,
                  metadata: {
                    ...block.metadata,
                    htmlSourceType: "powerpoint",
                    htmlConversionFormat: format,
                    htmlConversionStatus: "error",
                    sourcePowerPointName: file.fileName,
                    sourcePowerPointPath: file.filePath,
                  },
                });
              } finally {
                setConverting(false);
              }
            }}
          />

          {conversionMessage && (
            <div className={`rounded-xl px-4 py-3 text-sm ${String(block.metadata?.htmlConversionStatus) === "ready" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
              {conversionMessage}
            </div>
          )}

          {block.url && String(block.metadata?.htmlConversionStatus) === "ready" && (
            <div className="space-y-3">
              <p className="text-sm font-semibold text-emerald-700">Converted HTML lesson is ready.</p>
              <iframe
                title={block.title || "Converted PowerPoint lesson preview"}
                src={securePreviewUrl || block.url}
                sandbox="allow-scripts allow-forms allow-modals allow-popups allow-presentation allow-downloads"
                allow="fullscreen; autoplay"
                allowFullScreen
                className="min-h-[520px] w-full rounded-xl border bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>
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
}: {
  block: LessonBlock;
  onChange: (updatedBlock: LessonBlock) => void;
  folder: "images" | "pdfs" | "powerpoints" | "documents" | "html5";
  accept: string;
  uploadLabel: string;
  titlePlaceholder: string;
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
          Download uploaded file
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

