import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("purchased course products open the canonical course-unit route", async () => {
  const source = await readFile("src/pages/marketplace/StudentLearningLibraryPage.tsx", "utf8");
  assert.match(source, /return `\/courses\/\$\{encodeURIComponent\(product\.courseUnitId\)\}`/);
  assert.doesNotMatch(source, /student\/course-units\/\$\{product\.courseUnitId\}/);
});

test("students may self-update only editable profile fields", async () => {
  const rules = await readFile("firestore.rules", "utf8");
  const start = rules.indexOf("match /users/{userId}");
  const end = rules.indexOf("match /", start + 20);
  const block = rules.slice(start, end);
  assert.match(block, /affectedKeys\(\)\.hasOnly/);
  assert.match(block, /'fullName'.*'phoneNumber'.*'address'.*'emergencyContact'/s);
});

test("lesson builder supports sandboxed HTML5 authoring and upload", async () => {
  const model = await readFile("src/models/LessonBlock.tsx", "utf8");
  const builder = await readFile("src/pages/LessonBuilderPage.tsx", "utf8");
  const editor = await readFile("src/components/editor/LessonBlockRenderer.tsx", "utf8");
  const viewer = await readFile("src/components/lesson/LessonViewer.tsx", "utf8");
  assert.match(model, /\| "html5"/);
  assert.match(builder, /HTML5 \/ CSS/);
  assert.match(editor, /Upload HTML5 file/);
  assert.match(viewer, /sandbox="allow-scripts allow-forms/);
});

test("legacy Medi floating assistant is removed from role layouts", async () => {
  for (const path of ["src/components/layout/AdminLayout.tsx", "src/components/layout/TutorLayout.tsx", "src/components/layout/StudentLayout.tsx"]) {
    const source = await readFile(path, "utf8");
    assert.doesNotMatch(source, /MediFloatingAssistant/);
  }
  const header = await readFile("src/components/HeaderActions.tsx", "utf8");
  assert.match(header, /MediFloatingButton/);
});

test("platform plan editor documents unlimited data semantics", async () => {
  const source = await readFile("src/pages/platform/PlatformPlansPage.tsx", "utf8");
  assert.match(source, /Use -1 for Unlimited/);
  assert.match(source, /Capacity limits are plan data, not hard-coded access rules/);
});

test("marketplace purchases reconcile durable cross-tenant course access", async () => {
  const functions = await readFile("functions/src/index.ts", "utf8");
  const rules = await readFile("firestore.rules", "utf8");
  const library = await readFile("src/pages/marketplace/StudentLearningLibraryPage.tsx", "utf8");
  assert.match(functions, /refreshMarketplaceLearningAccess/);
  assert.match(functions, /marketplaceCourseAccess/);
  assert.match(rules, /hasMarketplaceCourseAccess/);
  assert.match(library, /refreshMarketplaceLearningAccess\(\)/);
});

test("student profile update uses trusted compatibility callable", async () => {
  const page = await readFile("src/pages/MyProfilePage.tsx", "utf8");
  const functions = await readFile("functions/src/index.ts", "utf8");
  assert.match(page, /updateOwnStudentProfile/);
  assert.match(functions, /export const updateOwnStudentProfile/);
  assert.doesNotMatch(page, /updateDoc\(doc\(db, "users"/);
});

test("lesson persistence normalizes HTML5 blocks to Firestore-safe entities", async () => {
  const lessons = await readFile("src/firebase/lessons.tsx", "utf8");
  assert.match(lessons, /firestoreSafeLessonBlocks/);
  assert.match(lessons, /safePayload\.blocks = firestoreSafeLessonBlocks/);
});
