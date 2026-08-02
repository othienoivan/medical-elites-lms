import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("student course-unit cards navigate with canonical Firestore ids", async () => {
  const [card, dashboard] = await Promise.all([
    read("src/components/ui/CourseCard.tsx"),
    read("src/pages/DashboardPage.tsx"),
  ]);

  assert.match(card, /\/courses\/\$\{encodeURIComponent\(course\.id\)\}/);
  assert.doesNotMatch(card, /\/courses\/\$\{course\.slug\}/);
  assert.match(dashboard, /\/courses\/\$\{encodeURIComponent\(courseUnit\.id\)\}/);
});

test("course-unit details resolve authenticated assigned units by id or legacy slug", async () => {
  const page = await read("src/pages/CourseUnitDetailsPage.tsx");

  assert.match(page, /useCourseUnits\(true\)/);
  assert.match(page, /item\.id === courseIdentifier \|\| item\.slug === courseIdentifier/);
  assert.match(page, /currentUser\s*\?\s*\[\.\.\.accessibleCourseUnits, \.\.\.publishedCourseUnits\]/);
});
