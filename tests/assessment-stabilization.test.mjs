import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const quizzes = readFileSync("src/firebase/quizzes.tsx", "utf8");
const createQuiz = readFileSync("src/pages/CreateQuizPage.tsx", "utf8");
const router = readFileSync("src/routes/AppRouter.tsx", "utf8");
const rules = readFileSync("firestore.rules", "utf8");

test("quiz list uses scoped tutor queries", () => {
  assert.match(quizzes, /where\("ownerUserId", "==", access\.uid\)/);
  assert.match(quizzes, /where\("assignedTutorIds", "array-contains", access\.uid\)/);
});

test("quiz creation writes canonical ownership", () => {
  assert.match(quizzes, /ownerUserId: user\.uid/);
  assert.match(quizzes, /createdByUid: user\.uid/);
});

test("AI options use alphabetic identifiers", () => {
  assert.match(createQuiz, /String\.fromCharCode\(65 \+ index\)/);
  assert.doesNotMatch(createQuiz, /`opt-\$\{index \+ 1\}`/);
});

test("question details route is registered", () => {
  assert.match(router, /path="\/tutor\/questions\/:questionId"/);
});

test("student quiz read is limited to published assignments", () => {
  assert.match(rules, /resource\.data\.status == 'published'/);
  assert.match(rules, /hasCourseUnitAssignment\(resource\.data\.courseUnitId\)/);
});
