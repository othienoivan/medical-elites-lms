import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("tutor and admin route namespaces are role-exclusive", async () => {
  const router = await read("src/routes/AppRouter.tsx");
  assert.match(router, /const TUTOR_ROLES: readonly UserRole\[\] = \["tutor"\]/);
  assert.match(router, /const ADMIN_ROLES: readonly UserRole\[\] = \["admin"\]/);
  assert.doesNotMatch(router, /const TUTOR_ROLES:[^\n]+admin/);
});

test("lesson resources use trusted short-lived access URLs and avoid cross-origin fetch downloads", async () => {
  const viewer = await read("src/components/lesson/LessonViewer.tsx");
  const helper = await read("src/firebase/lessonResourceAccess.ts");
  const functions = await read("functions/src/index.ts");
  assert.match(viewer, /getLessonResourceAccessUrl/);
  assert.doesNotMatch(viewer, /const response = await fetch\(url\)/);
  assert.match(helper, /getLessonResourceAccessUrl/);
  assert.match(functions, /export const getLessonResourceAccessUrl = onCall/);
  assert.match(functions, /getSignedUrl/);
  assert.match(functions, /lessonReferencesFilePath/);
});

test("converted HTML preview uses trusted access URL and keeps fullscreen delegation", async () => {
  const editor = await read("src/components/editor/LessonBlockRenderer.tsx");
  assert.match(editor, /securePreviewUrl/);
  assert.match(editor, /getLessonResourceAccessUrl/);
  assert.match(editor, /allow="fullscreen; autoplay"/);
  assert.match(editor, /allowFullScreen/);
});

test("direct tutor registration creates an independent tutor workspace", async () => {
  const register = await read("src/pages/RegisterPage.tsx");
  const firestore = await read("src/firebase/firestore.tsx");
  const functions = await read("functions/src/index.ts");
  assert.match(register, /workspaceMode: registeringTutor && !joinCode \? "independent" : undefined/);
  assert.match(firestore, /workspaceMode\?: "independent" \| "institution"/);
  assert.match(functions, /independentTutor/);
  assert.match(functions, /const tenantId = institutionId \|\| `tutor_\$\{uid\}`/);
});

test("quiz analytics is loaded through tutor-owned backend resolution", async () => {
  const page = await read("src/pages/QuizAnalyticsPage.tsx");
  const helper = await read("src/firebase/quizAnalytics.ts");
  const functions = await read("functions/src/index.ts");
  assert.match(page, /getTutorQuizAnalytics/);
  assert.doesNotMatch(page, /getQuizById\(/);
  assert.doesNotMatch(page, /getQuizAttemptsByQuiz\(/);
  assert.match(helper, /"getTutorQuizAnalytics"/);
  assert.match(functions, /export const getTutorQuizAnalytics = onCall/);
  assert.match(functions, /tutorOwnsQuizData/);
});

test("manual marking renders question snapshots rather than only question IDs", async () => {
  const page = await read("src/pages/ManualMarkingPage.tsx");
  const model = await read("src/models/QuizAttempt.tsx");
  const functions = await read("functions/src/index.ts");
  assert.match(page, /question\?\.questionText/);
  assert.doesNotMatch(page, /Question ID: \{answer\.questionId\}/);
  assert.match(model, /questionSnapshots\?: QuizAttemptQuestionSnapshot\[\]/);
  assert.match(functions, /loadTutorQuizQuestionSnapshots/);
});
