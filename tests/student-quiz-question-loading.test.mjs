import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const takeQuiz = fs.readFileSync("src/pages/TakeQuizPage.tsx", "utf8");
const createQuiz = fs.readFileSync("src/pages/CreateQuizPage.tsx", "utf8");
const rules = fs.readFileSync("firestore.rules", "utf8");

test("student quiz page loads only linked questions", () => {
  assert.match(takeQuiz, /getQuestionById/);
  assert.doesNotMatch(takeQuiz, /useQuestions/);
});

test("new quizzes embed question snapshots", () => {
  assert.match(createQuiz, /question: sourceQuestion\?\.questionText/);
  assert.match(createQuiz, /options: sourceQuestion\?\.options\.map/);
});

test("students may read published assigned questions", () => {
  assert.match(rules, /resource\.data\.isPublished == true/);
  assert.match(rules, /hasCourseUnitAssignment\(resource\.data\.courseUnitId\)/);
});

test("missing deterministic draft document can be read", () => {
  assert.match(rules, /draftId\.matches/);
});
