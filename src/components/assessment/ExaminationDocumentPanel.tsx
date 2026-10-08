import { Download, FileCheck2, FileText, Sparkles } from "lucide-react";

import FileUpload from "../upload/FileUpload";
import Button from "../ui/Button";
import Card from "../ui/Card";
import { extractReadableTextFromFile } from "../../utils/readableFileText";

export type ExaminationDocumentState = {
  uploadedExamUrl: string;
  uploadedExamFileName: string;
  uploadedExamFilePath: string;
  uploadedExamContentType: string;
  uploadedExamExtractedText: string;
  uploadedMarkingGuideUrl: string;
  uploadedMarkingGuideFileName: string;
  uploadedMarkingGuideFilePath: string;
  uploadedMarkingGuideContentType: string;
  uploadedMarkingGuideExtractedText: string;
  generatedMarkingGuideText: string;
  markingGuideGeneratedAt: string;
};

type Props = {
  value: ExaminationDocumentState;
  onChange: (value: ExaminationDocumentState) => void;
  onGenerateMarkingGuide: () => void;
  generating: boolean;
};

const ACCEPTED_EXAM_FILES = ".pdf,.docx,.txt,.html,.htm,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/html,application/vnd.openxmlformats-officedocument.presentationml.presentation";

export default function ExaminationDocumentPanel({ value, onChange, onGenerateMarkingGuide, generating }: Props) {
  return (
    <Card>
      <div className="flex items-start gap-3">
        <FileText className="mt-1 text-blue-700" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-slate-950">Examination Files</h2>
          <p className="mt-1 text-slate-600">Upload an existing examination and its marking guide, or let AI prepare a guide from readable examination text.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 p-4">
          <h3 className="flex items-center gap-2 font-bold text-slate-950"><FileText size={19} /> Examination paper</h3>
          <p className="mt-1 text-sm text-slate-600">Accepted: PDF, DOCX, TXT, HTML and PPTX.</p>
          <div className="mt-4">
            <FileUpload
              folder="documents"
              accept={ACCEPTED_EXAM_FILES}
              label={value.uploadedExamUrl ? "Replace Examination" : "Upload Examination"}
              customMetadata={{ resourceType: "examination-paper" }}
              onUploaded={async (uploaded) => {
                let extractedText = "";
                try {
                  extractedText = await extractReadableTextFromFile(uploaded.file);
                } catch (error) {
                  console.warn("Readable examination text could not be extracted.", error);
                }
                onChange({
                  ...value,
                  uploadedExamUrl: uploaded.downloadUrl,
                  uploadedExamFileName: uploaded.fileName,
                  uploadedExamFilePath: uploaded.filePath,
                  uploadedExamContentType: uploaded.contentType,
                  uploadedExamExtractedText: extractedText,
                });
              }}
            />
          </div>
          {value.uploadedExamUrl && (
            <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              Uploaded: {value.uploadedExamFileName || "Examination file"}{value.uploadedExamExtractedText ? " • Readable by AI" : " • No readable text detected"}
            </p>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 p-4">
          <h3 className="flex items-center gap-2 font-bold text-slate-950"><FileCheck2 size={19} /> Marking guide</h3>
          <p className="mt-1 text-sm text-slate-600">Upload an approved guide or generate a draft from the uploaded examination.</p>
          <div className="mt-4">
            <FileUpload
              folder="documents"
              accept={ACCEPTED_EXAM_FILES}
              label={value.uploadedMarkingGuideUrl ? "Replace Marking Guide" : "Upload Marking Guide"}
              customMetadata={{ resourceType: "examination-marking-guide" }}
              onUploaded={async (uploaded) => {
                let extractedText = "";
                try {
                  extractedText = await extractReadableTextFromFile(uploaded.file);
                } catch (error) {
                  console.warn("Readable marking-guide text could not be extracted.", error);
                }
                onChange({
                  ...value,
                  uploadedMarkingGuideUrl: uploaded.downloadUrl,
                  uploadedMarkingGuideFileName: uploaded.fileName,
                  uploadedMarkingGuideFilePath: uploaded.filePath,
                  uploadedMarkingGuideContentType: uploaded.contentType,
                  uploadedMarkingGuideExtractedText: extractedText,
                });
              }}
            />
          </div>
          {value.uploadedMarkingGuideUrl && (
            <p className="mt-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">Uploaded: {value.uploadedMarkingGuideFileName || "Marking guide"}{value.uploadedMarkingGuideExtractedText ? " • Authoritative AI marking source" : " • Replace this file to enable AI reading"}</p>
          )}
          <Button
            type="button"
            variant="outline"
            disabled={generating || value.uploadedExamExtractedText.trim().length < 80}
            onClick={onGenerateMarkingGuide}
            className="mt-4 w-full"
          >
            <Sparkles size={17} />{generating ? "Generating Marking Guide..." : "Generate Marking Guide with AI"}
          </Button>
          {!value.uploadedExamExtractedText && <p className="mt-2 text-xs text-amber-700">Upload a readable examination before using AI generation.</p>}
        </section>
      </div>

      {value.generatedMarkingGuideText && (
        <section className="mt-6 rounded-2xl border border-indigo-200 bg-indigo-50 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-bold text-indigo-950">AI-generated marking guide</h3>
            <span className="text-xs font-semibold text-indigo-700">Tutor review required</span>
          </div>
          <textarea
            value={value.generatedMarkingGuideText}
            onChange={(event) => onChange({ ...value, generatedMarkingGuideText: event.target.value })}
            className="mt-3 min-h-72 w-full rounded-xl border border-indigo-200 bg-white p-4 leading-7"
            aria-label="AI-generated marking guide"
          />
          <p className="mt-2 flex items-center gap-2 text-xs text-indigo-700"><Download size={14} />The reviewed guide will be downloadable from Examination Details after saving.</p>
        </section>
      )}
    </Card>
  );
}

