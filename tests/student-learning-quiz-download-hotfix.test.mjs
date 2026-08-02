import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('module cards use persisted learning states', async () => {
  const [card, progression, details] = await Promise.all([
    read('src/components/ui/ModuleCard.tsx'),
    read('src/hooks/useModuleProgression.tsx'),
    read('src/pages/CourseUnitDetailsPage.tsx'),
  ]);
  assert.match(card, /Start Module/);
  assert.match(card, /Continue Learning/);
  assert.match(card, /Review Module/);
  assert.match(progression, /startedModules/);
  assert.match(progression, /completedModules/);
  assert.match(details, /markModuleStarted/);
  assert.match(details, /getLearningState/);
});

test('quiz attempts are enforced by a trusted callable and browser writes are denied', async () => {
  const [functions, service, page, rules] = await Promise.all([
    read('functions/src/index.ts'),
    read('src/firebase/quizAttempts.tsx'),
    read('src/pages/TakeQuizPage.tsx'),
    read('firestore.rules'),
  ]);
  assert.match(functions, /export const submitQuizAttempt = onCall/);
  assert.match(functions, /attemptsUsed >= maximumAttempts/);
  assert.match(functions, /quizAttemptCounters/);
  assert.match(service, /httpsCallable<QuizAttempt/);
  assert.match(page, /You have used all the attempts allowed for this quiz/);
  assert.match(page, /Attempts remaining/);
  assert.match(rules, /match \/quizAttempts\/\{attemptId\}[\s\S]*allow create: if false/);
});

test('PDF and PowerPoint lesson resources are download only', async () => {
  const [viewer, documentViewer, powerPointViewer] = await Promise.all([
    read('src/components/lesson/LessonViewer.tsx'),
    read('src/components/lesson/DocumentViewer.tsx'),
    read('src/components/lesson/PowerPointViewer.tsx'),
  ]);
  const pdfAndPowerPoint = viewer.match(/block\.type === "pdf"[\s\S]*?block\.type === "document"/)?.[0] ?? "";
  assert.doesNotMatch(pdfAndPowerPoint, /<iframe/);
  assert.doesNotMatch(documentViewer, /<iframe/);
  assert.doesNotMatch(powerPointViewer, /<iframe/);
  assert.match(viewer, /Download PowerPoint/);
  assert.match(documentViewer, /Download only/);
});

test('course-unit not-found recovery opens the published catalogue', async () => {
  const [details, catalogue] = await Promise.all([
    read('src/pages/CourseUnitDetailsPage.tsx'),
    read('src/pages/CourseUnitPage.tsx'),
  ]);
  assert.match(details, /Browse Published Course Units/);
  assert.match(details, /navigate\("\/courses"\)/);
  assert.match(catalogue, /usePublishedCourseUnits/);
});
