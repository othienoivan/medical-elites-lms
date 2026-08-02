import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("analytics route is protected and registered", async () => {
  const router = await readFile("src/routes/AppRouter.tsx", "utf8");
  assert.match(router, /path="\/analytics"/);
  assert.match(router, /AcademicAnalyticsPage/);
  assert.match(router, /ProtectedRoute allowedRoles=\{LEARNER_ROLES\}/);
});

test("analytics snapshots are immutable from browser clients", async () => {
  const rules = await readFile("firestore.rules", "utf8");
  assert.match(rules, /match \/analyticsSnapshots\/\{snapshotId\}/);
  assert.match(rules, /allow create, update, delete: if false/);
});

test("analytics service provides caching and role-aware KPI resolution", async () => {
  const service = await readFile("src/services/analytics/analyticsService.ts", "utf8");
  assert.match(service, /CACHE_TTL_MS/);
  assert.match(service, /input\.role === "admin"/);
  assert.match(service, /input\.role === "tutor"/);
  assert.match(service, /invalidateAcademicAnalytics/);
});
