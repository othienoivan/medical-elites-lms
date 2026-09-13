import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const lessonViewer = fs.readFileSync("src/components/lesson/LessonViewer.tsx", "utf8");
const courseDetails = fs.readFileSync("src/pages/CourseUnitDetailsPage.tsx", "utf8");

test("Word lesson resources are download-only and no longer use Office web preview", () => {
  assert.doesNotMatch(lessonViewer, /OfficeDocumentViewer/);
  assert.match(lessonViewer, /Download Word Document/);
  assert.match(lessonViewer, /Browser preview has been disabled/);
  assert.match(lessonViewer, /getLessonResourceAccessUrl/);
});

test("course detail modules are anchored to the canonical public course unit", () => {
  assert.match(courseDetails, /publicRouteCourseUnit/);
  assert.match(courseDetails, /canonicalCourseUnitId/);
  assert.match(courseDetails, /courseAliases/);
  assert.match(courseDetails, /getPublishedCourseModulesV2/);
  assert.match(courseDetails, /setModules\(result\.modules\)/);
});

test("non-entitled visitors receive buy and subscription calls to action", () => {
  assert.match(courseDetails, /Buy This Course Unit/);
  assert.match(courseDetails, /Subscribe for Access/);
  assert.match(courseDetails, /Course content is locked/);
  assert.match(courseDetails, /marketplace\/products/);
});
