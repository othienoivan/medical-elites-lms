import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function text(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("HTML5 lesson block lets tutors convert PPTX to either supported HTML format", async () => {
  const renderer = await text("src/components/editor/LessonBlockRenderer.tsx");
  assert.match(renderer, /Convert PowerPoint to HTML/);
  assert.match(renderer, /html-package/);
  assert.match(renderer, /self-contained-html5/);
  assert.match(renderer, /Upload PowerPoint \(\.pptx\) and convert/);
});

test("PowerPoint HTML conversion is requested through upload metadata", async () => {
  const upload = await text("src/firebase/storage.tsx");
  const fileUpload = await text("src/components/upload/FileUpload.tsx");
  assert.match(upload, /customMetadata\?: Record<string, string>/);
  assert.match(fileUpload, /customMetadata/);
});

test("Office converter renders PPTX slides and emits both HTML delivery modes", async () => {
  const service = await text("office-conversion-service/src/index.js");
  const dockerfile = await text("office-conversion-service/Dockerfile");
  assert.match(service, /pdftoppm/);
  assert.match(service, /self-contained-html5/);
  assert.match(service, /html-package/);
  assert.match(service, /buildSlideViewerHtml/);
  assert.match(dockerfile, /poppler-utils/);
});
