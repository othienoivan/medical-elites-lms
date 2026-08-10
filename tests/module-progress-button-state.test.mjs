import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const hook = fs.readFileSync("src/hooks/useModuleProgression.tsx", "utf8");
const card = fs.readFileSync("src/components/ui/ModuleCard.tsx", "utf8");
const page = fs.readFileSync("src/pages/CourseUnitDetailsPage.tsx", "utf8");
const backend = fs.readFileSync("functions/src/index.ts", "utf8");
const rules = fs.readFileSync("firestore.rules", "utf8");

test("module cards expose all three progress-aware action labels", () => {
  assert.match(card, /Start Module/);
  assert.match(card, /Continue Learning/);
  assert.match(card, /Review Module/);
});

test("course-unit module cards use persisted progression state", () => {
  assert.match(page, /learningState=\{progression\.getLearningState\(module\.id\)\}/);
  assert.match(page, /markModuleStarted/);
});

test("progress loader supports legacy and canonical enrollment identities", () => {
  assert.match(hook, /where\("studentId",\s*"==",\s*[^)]+\)/);
  assert.match(hook, /directEnrollmentId/);
  assert.match(hook, /assignedCourseUnitIds/);
});

test("quiz pass fallback uses the tutor-defined pass mark", () => {
  assert.match(hook, /quiz\?\.passMark \?\? 50/);
});

test("module completion recalculates overall enrollment progress on the backend", () => {
  assert.match(backend, /publishedModuleCount/);
  assert.match(backend, /existingCompleted\.size \/ publishedModuleCount/);
  assert.match(backend, /progress,/);
});

test("students cannot directly write completedModules", () => {
  const enrollmentRule = rules.slice(rules.indexOf("match /enrollments/{enrollmentId}"), rules.indexOf("match /contactRequests/{requestId}"));
  assert.ok(!enrollmentRule.includes("'completedModules'"));
});
