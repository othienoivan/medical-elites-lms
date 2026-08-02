import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const lessonViewer = fs.readFileSync("src/components/lesson/LessonViewer.tsx", "utf8");
const officeViewer = fs.readFileSync("src/components/lesson/OfficeDocumentViewer.tsx", "utf8");
const lessonBlockRenderer = fs.readFileSync("src/components/editor/LessonBlockRenderer.tsx", "utf8");
const lessonPage = fs.readFileSync("src/pages/LessonPage.tsx", "utf8");

test("PDF and PowerPoint lesson blocks are download-only", () => {
  assert.match(lessonViewer, /block\.type === "pdf"[\s\S]*?<DownloadAttachment/);
  assert.match(lessonViewer, /block\.type === "powerpoint"[\s\S]*?<DownloadAttachment/);
  assert.doesNotMatch(lessonViewer, /manualPreviewPdfUrl=/);
});

test("lesson authoring no longer exposes PDF preview controls", () => {
  assert.doesNotMatch(lessonBlockRenderer, /Browser preview PDF/);
  assert.doesNotMatch(lessonBlockRenderer, /Upload PDF Preview/);
  assert.doesNotMatch(lessonBlockRenderer, /Replace PDF Preview/);
  assert.doesNotMatch(lessonBlockRenderer, /Open uploaded PDF preview/);
  assert.doesNotMatch(lessonBlockRenderer, /requirePdfPreview/);
});

test("Office document viewer never embeds a generated PDF preview", () => {
  assert.doesNotMatch(officeViewer, /manualPreviewPdfUrl/);
  assert.doesNotMatch(officeViewer, /PDF preview available/);
  assert.doesNotMatch(officeViewer, /title=\{`\$\{title\} PDF preview`\}/);
});

test("standalone lesson resources keep PDF and PowerPoint as download-only", () => {
  assert.match(lessonPage, /resource\.type === "pdf" \|\| resource\.type === "ppt"/);
  assert.match(lessonPage, /Download only/);
});
