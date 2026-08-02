import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("curriculum catalogue reads are tutor scoped", async () => {
  const source = await readFile("src/firebase/curriculumImport.ts", "utf8");
  assert.doesNotMatch(source, /getDocs\(collection\(db, "programmes"\)\)/);
  assert.doesNotMatch(source, /getDocs\(collection\(db, "courses"\)\)/);
  assert.doesNotMatch(source, /getDocs\(collection\(db, "modules"\)\)/);
  assert.match(source, /where\("ownerUserId", "==", actor\.uid\)/);
  assert.match(source, /where\("assignedTutorIds", "array-contains", actor\.uid\)/);
});

test("imported academic records include hardened ownership fields", async () => {
  const source = await readFile("src/firebase/curriculumImport.ts", "utf8");
  assert.match(source, /ownerUserId: actor\.uid/);
  assert.match(source, /createdByUid: actor\.uid/);
  assert.match(source, /assignedTutorIds: \[actor\.uid\]/);
  assert.match(source, /institutionId: actor\.institutionId \?\? null/);
});

test("module creation removes undefined Firestore fields", async () => {
  const source = await readFile("src/firebase/modules.tsx", "utf8");
  assert.match(source, /function removeUndefined/);
  assert.match(source, /await setDoc\(ref, removeUndefined/);
  assert.doesNotMatch(source, /await addDoc\(collection\(db, COLLECTION\)/);
});

test("tutor management pages include imported draft catalogue records", async () => {
  const programmes = await readFile("src/pages/ProgrammeManagerPage.tsx", "utf8");
  const curriculum = await readFile("src/pages/CurriculumExplorerPage.tsx", "utf8");
  const modules = await readFile("src/pages/ModuleManagerPage.tsx", "utf8");
  const createModule = await readFile("src/pages/CreateModulePage.tsx", "utf8");

  assert.match(programmes, /useProgrammes\(true\)/);
  assert.match(curriculum, /useProgrammes\(true\)/);
  assert.match(curriculum, /useCourseUnits\(true\)/);
  assert.match(modules, /useModules\(courseUnitId, true\)/);
  assert.match(createModule, /useProgrammes\(true\)/);
  assert.match(createModule, /useCourseUnits\(true\)/);
});

test("module visibility queries isolate optional permission failures", async () => {
  const source = await readFile("src/firebase/modules.tsx", "utf8");
  assert.match(source, /Promise\.allSettled/);
  assert.match(source, /Module visibility query/);
  assert.doesNotMatch(source, /const \[owned, assigned, \.\.\.byProgramme\] = await Promise\.all/);
});

test("assigned tutor rules support array-contains queries", async () => {
  const rules = await readFile("firestore.rules", "utf8");
  assert.match(rules, /request\.auth\.uid in data\.assignedTutorIds/);
  assert.doesNotMatch(rules, /data\.assignedTutorIds is list/);
});

test("service worker ignores unsupported request schemes", async () => {
  const source = await readFile("public/sw.js", "utf8");
  assert.match(source, /url\.protocol !== "http:"/);
  assert.match(source, /url\.protocol !== "https:"/);
  assert.match(source, /response\.ok/);
});
