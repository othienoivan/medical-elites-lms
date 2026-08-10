import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("paid tutor checkout resolves canonical plans and tutor workspace ownership", async () => {
  const source = await readFile("functions/src/index.ts", "utf8");
  assert.match(source, /db\.collection\("plans"\)\.doc\(id\)/);
  assert.match(source, /resolveTutorSubscriptionTenant/);
  assert.match(source, /assertTutorPlanCanBePurchased/);
  assert.match(source, /customerTenantId/);
});

test("verified subscription payments activate canonical tenant subscription and plan", async () => {
  const source = await readFile("functions/src/index.ts", "utf8");
  assert.match(source, /db\.collection\("subscriptions"\)\.doc\(tenantId\)/);
  assert.match(source, /db\.collection\("tenants"\)\.doc\(tenantId\)/);
  assert.match(source, /subscriptionStatus:\s*"active"/);
  assert.match(source, /subscriptionHistory/);
  assert.match(source, /action:\s*isSameActivePlan \? "renewed" : "activated"/);
});

test("subscription expiry falls back to Free Tutor without disabling the workspace", async () => {
  const source = await readFile("functions/src/index.ts", "utf8");
  assert.match(source, /refreshTutorSubscriptionLifecycle/);
  assert.match(source, /planId:\s*"tutor_free"/);
  assert.match(source, /subscriptionStatus:\s*"expired"/);
  assert.match(source, /status:\s*"active"/);
  assert.match(source, /Subscription expiry never disables the tutor account or workspace/);
});

test("subscription centre reconciles Flutterwave redirects and supports period-end cancellation", async () => {
  const page = await readFile("src/pages/TutorSubscriptionPage.tsx", "utf8");
  const repo = await readFile("src/domains/finance/infrastructure/commerceRepository.ts", "utf8");
  assert.match(page, /transaction_id/);
  assert.match(page, /reconcileCommercePayment/);
  assert.match(page, /Payment verified\. Your paid tutor plan is now active/);
  assert.match(page, /Cancel at period end/);
  assert.match(repo, /refreshTutorSubscriptionLifecycle/);
  assert.match(repo, /cancelTutorSubscriptionAtPeriodEnd/);
});
