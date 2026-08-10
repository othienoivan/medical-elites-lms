import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const providerPath = new URL("../src/components/TenantProvider.tsx", import.meta.url);
const subscriptionPagePath = new URL("../src/pages/TutorSubscriptionPage.tsx", import.meta.url);
const defaultsPath = new URL("../src/models/defaultPlans.ts", import.meta.url);

test("new public tutor registration bootstraps a free workspace and does not require plan selection", async () => {
  const provider = await fs.readFile(providerPath, "utf8");

  assert.match(provider, /bootstrapTenantWorkspace/);
  assert.match(provider, /legacyWorkspace/);
  assert.match(provider, /tutor_free/);
});

test("tutor free plan is a first-class default entitlement snapshot", async () => {
  const defaults = await fs.readFile(defaultsPath, "utf8");

  assert.match(defaults, /Free Tutor/);
  assert.match(defaults, /tutor_free/);
  assert.match(defaults, /TUTOR_FREE_PLAN/);
});

test("tenant provider separates subscription status from account status", async () => {
  const provider = await fs.readFile(providerPath, "utf8");

  assert.match(
    provider,
    /resolvedSubscription\.status === "active"/,
  );

  assert.match(
    provider,
    /resolvedSubscription\.status === "trialing"/,
  );

  assert.match(
    provider,
    /setActiveSubscription\(resolvedSubscription\)/,
  );

  assert.match(
    provider,
    /setActivePlan/,
  );
});

test("tutor subscription centre is protected and optional upgrade is exposed", async () => {
  const page = await fs.readFile(subscriptionPagePath, "utf8");

  assert.match(page, /refreshTutorSubscriptionLifecycle/);
  assert.match(page, /Upgrade options/);
  assert.match(page, /TUTOR_FREE_PLAN/);
});