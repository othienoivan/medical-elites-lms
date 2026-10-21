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
  assert.match(page, /Changes are retained in this browser/);
});

test("seminar manager supports shared Firestore persistence with restricted rules", async () => {
  const [page, service, rules] = await Promise.all([
    readFile("src/pages/SeminarManagementPage.tsx", "utf8"),
    readFile("src/firebase/seminars.ts", "utf8"),
    readFile("firestore.rules", "utf8"),
  ]);
  assert.match(page, /Save shared data/);
  assert.match(service, /collection|"seminars"/);
  assert.match(service, /committeeUids/);
  assert.match(rules, /match \/seminars\/\{seminarId\}/);
  assert.match(rules, /request\.resource\.data\.ownerUid == request\.auth\.uid/);
});
