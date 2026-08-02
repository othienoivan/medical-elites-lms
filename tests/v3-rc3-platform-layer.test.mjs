import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("RC3 platform routes are isolated under /platform", async () => {
  const router = await read("src/routes/AppRouter.tsx");
  for (const route of ["/platform", "/platform/tenants", "/platform/plans", "/platform/feature-flags", "/platform/licenses", "/platform/support"]) {
    assert.match(router, new RegExp(route.replaceAll("/", "\\/")));
  }
  assert.match(router, /PlatformAccessGate/);
});

test("platform bounded context uses domain application infrastructure presentation layers", async () => {
  const index = await read("src/domains/platform/index.ts");
  assert.match(index, /domain\/platformTypes/);
  assert.match(index, /application\/platformService/);
  assert.match(index, /infrastructure\/platformRepository/);
});

test("platform Firestore collections are explicit and default deny remains", async () => {
  const rules = await read("firestore.rules");
  for (const collection of ["tenants", "plans", "featureFlags", "auditLogs", "supportTickets", "platformAnnouncements", "platformUsage", "roadmapItems", "licenseGrants", "platformSettings"]) {
    assert.match(rules, new RegExp(`match \\/${collection}\\/`));
  }
  assert.match(rules, /match \/\{document=\*\*\}/);
  assert.match(rules, /allow read, write: if false/);
});

test("academic LMS routes remain present", async () => {
  const router = await read("src/routes/AppRouter.tsx");
  for (const route of ["/tutor/lessons", "/tutor/students", "/tutor/assessments", "/tutor/questions", "/student/course-units", "/messages"]) {
    assert.match(router, new RegExp(route.replaceAll("/", "\\/")));
  }
});
