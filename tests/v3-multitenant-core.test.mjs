import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("platform layer wraps the LMS without replacing the stable runtime", async () => {
  const main = await read("src/main.tsx");
  assert.match(main, /AuthProvider/);
  assert.doesNotMatch(main, /TenantProvider/);
  const router = await read("src/routes/AppRouter.tsx");
  assert.match(router, /PlatformAccessGate/);
  assert.match(router, /path="\/platform"/);
  assert.match(router, /path="\/tutor\/lessons"/);
});

test("tenant and plan models define the additive SaaS core", async () => {
  const platformIndex = await read("src/domains/platform/index.ts");
  assert.match(platformIndex, /platformTypes/);
  assert.match(platformIndex, /platformService/);
  assert.match(platformIndex, /platformRepository/);
});

test("platform console is protected by the centralized access gate", async () => {
  const gate = await read("src/components/platform/PlatformAccessGate.tsx");
  assert.match(gate, /hasPlatformAccess/);
  assert.match(gate, /super_admin/);
  assert.match(gate, /Navigate/);
  const router = await read("src/routes/AppRouter.tsx");
  assert.match(router, /PlatformAccessGate/);
});

test("security rules include additive platform collections without changing academic collections", async () => {
  const rules = await read("firestore.rules");
  for (const collection of ["tenants", "plans", "featureFlags", "auditLogs", "supportTickets", "platformAnnouncements", "platformUsage", "roadmapItems", "licenseGrants", "platformSettings"]) {
    assert.match(rules, new RegExp(`match \\/${collection}\\/`));
  }
  for (const collection of ["students", "courses", "modules", "lessons", "quizzes", "questions"]) {
    assert.match(rules, new RegExp(`match \\/${collection}\\/`));
  }
  assert.match(rules, /match \/\{document=\*\*\}/);
  assert.match(rules, /allow read, write: if false/);
});
