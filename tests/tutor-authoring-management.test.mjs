import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (file) => readFileSync(file, "utf8");

test("lesson creation includes hardened tutor ownership metadata", () => {
  const page = read("src/pages/CreateLessonPage.tsx");
  const service = read("src/firebase/lessons.tsx");
  assert.match(page, /ownerUserId: currentUser\.uid/);
  assert.match(page, /assignedTutorIds: \[currentUser\.uid\]/);
  assert.match(service, /setDoc\(ref/);
  assert.doesNotMatch(service, /addDoc/);
});

test("lesson reads are role-scoped rather than broad module reads", () => {
  const service = read("src/firebase/lessons.tsx");
  assert.match(service, /where\("ownerUserId", "==", access\.uid\)/);
  assert.match(service, /where\("assignedTutorIds", "array-contains", access\.uid\)/);
  assert.match(service, /where\("isPublished", "==", true\)/);
});

test("programme and module editing routes are implemented", () => {
  const router = read("src/routes/AppRouter.tsx");
  assert.match(router, /programmes\/:programmeId\/edit/);
  assert.match(router, /modules\/:moduleId\/edit/);
  assert.doesNotMatch(read("src/pages/ProgrammeManagerPage.tsx"), /Programme editing coming next/);
});

test("course units support merge and guarded delete", () => {
  const service = read("src/firebase/courseUnits.tsx");
  const page = read("src/pages/CurriculumExplorerPage.tsx");
  assert.match(service, /export async function mergeCourseUnits/);
  assert.match(service, /batch\.delete\(sourceSnap\.ref\)/);
  assert.match(page, /mergeCourseUnits/);
  assert.match(page, /deleteCourseUnit/);
});
