import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("trusted tutor lifecycle overrides the Free Tutor compatibility snapshot", async () => {
  const provider = await readFile("src/components/TenantProvider.tsx", "utf8");
  assert.match(provider, /refreshTutorSubscriptionLifecycle/);
  assert.match(provider, /isPaidTutorLifecycle/);
  assert.match(provider, /const paidPlan = await getPlan\(lifecycle\.planId\)/);
  assert.match(provider, /resolvedPlan = paidPlan/);
  assert.match(provider, /setActivePlan\(effectivePlan\(paidPlan, "tutor"\)\)/);
});

test("workspace permission failure cannot erase a verified paid tutor plan", async () => {
  const provider = await readFile("src/components/TenantProvider.tsx", "utf8");
  const catchStart = provider.indexOf('console.error("Failed to resolve the active tenant workspace:"');
  assert.notEqual(catchStart, -1);
  const catchBlock = provider.slice(catchStart);
  assert.match(catchBlock, /refreshTutorSubscriptionLifecycle/);
  assert.match(catchBlock, /lifecycle\.planId !== "tutor_free"|isPaidTutorLifecycle/);
  assert.match(catchBlock, /setActiveSubscription\(lifecycleSubscription\(lifecycle\)\)/);
  assert.match(catchBlock, /setActivePlan\(effectivePlan\(paidPlan, "tutor"\)\)/);
});
