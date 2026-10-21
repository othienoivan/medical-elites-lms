import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("seminar manager exposes the approved workflow and route", async () => {
  const [page, router, layout] = await Promise.all([
    readFile("src/pages/SeminarManagementPage.tsx", "utf8"),
    readFile("src/routes/AppRouter.tsx", "utf8"),
    readFile("src/components/layout/TutorLayout.tsx", "utf8"),
  ]);
  assert.match(router, /path="\/seminar"/);
  assert.match(layout, /Seminar Management/);
  for (const section of ["schedule", "tasks", "attendance", "scores", "budget"]) assert.match(page, new RegExp(section));
  assert.match(page, /2-8 November 2026/);
  assert.match(page, /11 programmes/);
  assert.match(page, /80% of assigned sessions/);
  assert.match(page, /Entries are saved in this browser/);
});
