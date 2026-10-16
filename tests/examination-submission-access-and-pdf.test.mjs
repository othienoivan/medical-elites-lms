import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("programme-assigned students may submit published examinations", () => {
  const rules = read("firestore.rules");
  const start = rules.indexOf("match /examinationSubmissions/{documentId}");
  const block = rules.slice(start, rules.indexOf("match /examinationMarkingReviews/{documentId}", start));
  assert.match(block, /hasProgrammeAssignment/);
  assert.match(block, /hasCourseUnitAssignment/);
  assert.match(block, /request\.resource\.data\.studentId == request\.auth\.uid/);
  assert.match(block, /data\.status == 'published'/);
});

test("submission stores an immutable question snapshot", () => {
  const source = read("src/firebase/examinationSubmissions.ts");
  assert.match(source, /questionsSnapshot: parseOnlineExamination/);
});

test("tutor submissions are grouped and exportable as PDF", () => {
  const source = read("src/pages/ExaminationSubmissionsPage.tsx");
  assert.match(source, /new jsPDF/);
  assert.match(source, /Download Attempt PDF/);
  assert.match(source, /grouped\.map/);
  assert.match(source, /Course Unit/);
});
