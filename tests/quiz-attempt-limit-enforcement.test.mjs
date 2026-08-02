import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const takeQuiz = fs.readFileSync('src/pages/TakeQuizPage.tsx', 'utf8');
const assessments = fs.readFileSync('src/pages/StudentAssessmentPage.tsx', 'utf8');
const entry = fs.readFileSync('src/pages/AssessmentEntryPage.tsx', 'utf8');
const lesson = fs.readFileSync('src/pages/LessonPage.tsx', 'utf8');
const service = fs.readFileSync('src/firebase/quizAttempts.tsx', 'utf8');
const backend = fs.readFileSync('functions/src/index.ts', 'utf8');
const rules = fs.readFileSync('firestore.rules', 'utf8');
const indexes = fs.readFileSync('firestore.indexes.json', 'utf8');

test('student assessment catalogue keeps retakes visible until limit is exhausted', () => {
  assert.match(assessments, /attemptsRemaining > 0/);
  assert.match(assessments, /Retake Assessment/);
  assert.match(assessments, /Attempts used:/);
  assert.match(assessments, /Maximum:/);
  assert.match(assessments, /Remaining:/);
});

test('assessment entry disables starting when all attempts are used', () => {
  assert.match(entry, /You have used all the attempts allowed for this quiz/);
  assert.match(entry, /disabled=\{completedAttempts\.length >= attemptsAllowed\}/);
  assert.match(entry, /Retake Assessment/);
});

test('take page blocks exhausted attempts and displays usage', () => {
  assert.match(takeQuiz, /Quiz Attempt Limit Reached/);
  assert.match(takeQuiz, /Attempts used/);
  assert.match(takeQuiz, /Maximum attempts/);
  assert.match(takeQuiz, /Attempts remaining/);
});

test('module quiz opens the guarded assessment entry page', () => {
  assert.match(lesson, /navigate\(`\/assessments\/quizzes\/\$\{moduleQuiz\.id\}`\)/);
  assert.doesNotMatch(lesson, /moduleQuiz\.id\}\/take/);
});

test('client usage query scopes by student and quiz', () => {
  assert.match(service, /where\("studentId", "==", studentId\)[\s\S]*where\("quizId", "==", quizId\)/);
});

test('backend atomically enforces maximum attempts', () => {
  assert.match(backend, /export const submitQuizAttempt = onCall/);
  assert.match(backend, /where\("studentId", "==", uid\)[\s\S]*where\("quizId", "==", quizId\)/);
  assert.match(backend, /attemptsUsed >= maximumAttempts/);
  assert.match(backend, /resource-exhausted/);
  assert.match(backend, /attemptNumber: nextUsed/);
});

test('browser clients cannot create or delete submitted attempts', () => {
  assert.match(rules, /match \/quizAttempts\/\{attemptId\}[\s\S]*allow create: if false/);
  assert.match(rules, /match \/quizAttempts\/\{attemptId\}[\s\S]*allow delete: if false/);
  assert.match(rules, /affectedKeys\(\)\.hasOnly/);
});

test('quiz attempt usage index is declared', () => {
  const parsed = JSON.parse(indexes);
  assert.ok(parsed.indexes.some((item) => item.collectionGroup === 'quizAttempts'
    && item.fields?.some((field) => field.fieldPath === 'studentId')
    && item.fields?.some((field) => field.fieldPath === 'quizId')));
});
