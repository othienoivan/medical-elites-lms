import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");

test("quiz attempt inbox uses cursor pagination", () => {
  const service = read("src/firebase/quizAttempts.tsx");
  assert.match(service, /export async function getQuizAttemptsPage/);
  assert.match(service, /orderBy\("createdAt", "desc"\)/);
  assert.match(service, /startAfter\(cursor\)/);
  assert.match(service, /limit\(safePageSize \+ 1\)/);
});

test("submission inbox exposes load more state", () => {
  const hook = read("src/hooks/useTutorQuizAttempts.tsx");
  const page = read("src/pages/SubmissionInboxPage.tsx");
  assert.match(hook, /loadMore/);
  assert.match(hook, /hasMore/);
  assert.match(page, /Load more submissions/);
  assert.match(page, /loadingMore/);
});

test("lesson media is lazy loaded", () => {
  const viewer = read("src/components/lesson/LessonViewer.tsx");
  assert.match(viewer, /loading="lazy"/);
  assert.match(viewer, /decoding="async"/);
});
