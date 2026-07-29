import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("manage modules preserves the selected course-unit filter", async () => {
  const curriculum = await readFile("src/pages/CurriculumExplorerPage.tsx", "utf8");
  const manager = await readFile("src/pages/ModuleManagerPage.tsx", "utf8");
  assert.match(curriculum, /modules\?courseUnitId=/);
  assert.match(manager, /searchParams\.get\("courseUnitId"\)/);
  assert.match(manager, /useModules\(courseUnitId, true\)/);
});

test("registration-link matching normalises legacy academic values and publication flags", async () => {
  const page = await readFile("src/pages/RegistrationLinksPage.tsx", "utf8");
  assert.match(page, /normalizeAcademicValue/);
  assert.match(page, /isPublishedCourseUnit/);
  assert.match(page, /courseUnit\.isPublished/);
  assert.match(page, /courseUnit\.status/);
  assert.match(page, /publishedModuleCourseUnitIds\.has\(courseUnit\.id\)/);
  assert.match(page, /linkType === "programme"/);
  assert.match(page, /linkType === "class"/);
  assert.match(page, /linkType === "course-unit"/);
});

test("tutor and institution registration links do not require programme allocation", async () => {
  const page = await readFile("src/pages/RegistrationLinksPage.tsx", "utf8");
  assert.match(page, /requiresProgramme/);
  assert.match(page, /linkType === "tutor" \|\| linkType === "institution"/);
  assert.match(page, /Students can now join using this link/);
});
