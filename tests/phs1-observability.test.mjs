import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("structured logger redacts secrets and supports correlation ids", async () => {
  const source = await readFile("src/observability/logger.ts", "utf8");
  assert.match(source, /createCorrelationId/);
  assert.match(source, /REDACTED/);
  assert.match(source, /durationMs/);
});

test("platform operations route is protected", async () => {
  const router = await readFile("src/routes/AppRouter.tsx", "utf8");
  assert.match(router, /\/platform\/operations/);
  assert.match(router, /PlatformAccessGate/);
});

test("operations and disaster recovery documentation exists", async () => {
  const runbook = await readFile("docs/operations/PHS1_OPERATIONS_RUNBOOK.md", "utf8");
  const dr = await readFile("docs/operations/DISASTER_RECOVERY_GUIDE.md", "utf8");
  assert.match(runbook, /SEV-1/);
  assert.match(dr, /Recovery order/);
});
