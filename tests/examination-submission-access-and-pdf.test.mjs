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

test("mobile browsers without the Fullscreen API can start securely", () => {
  const source = read("src/pages/StudentExaminationSittingPage.tsx");
  assert.match(source, /if\(!fullscreenSupported\)\{setStarted\(true\);return\}/);
  assert.match(source, /Start Secure Examination/);
  assert.match(source, /document\.hidden/);
  assert.match(source, /if\(fullscreenSupported\)document\.addEventListener\("fullscreenchange"/);
});

test("answers use global-position keys instead of repeated section numbers", () => {
  const parser = read("src/utils/onlineExaminationParser.ts");
  const sitting = read("src/pages/StudentExaminationSittingPage.tsx");
  const submissions = read("src/firebase/examinationSubmissions.ts");
  const tutorPage = read("src/pages/ExaminationSubmissionsPage.tsx");
  assert.match(parser, /return `q_\$\{index \+ 1\}`/);
  assert.match(sitting, /onlineExamAnswerKey\(question,currentIndex\)/);
  assert.doesNotMatch(sitting, /answers\[String\(question\.number\)\]/);
  assert.match(submissions, /answerKey: onlineExamAnswerKey\(question, index\)/);
  assert.match(tutorPage, /item\.answersJson\?\.\[answerKey\]/);
});

test("uploaded examination headings decode entities and exclude instructions", () => {
  const parser = read("src/utils/onlineExaminationParser.ts");
  assert.match(parser, /decodeHtmlEntities\(source\)/);
  assert.ok(parser.includes("&#x([0-9a-f]+);"));
  assert.ok(parser.includes("marks?"));

});
