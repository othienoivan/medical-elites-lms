import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";

const providerPath = new URL("../src/components/TenantProvider.tsx", import.meta.url);
const tenantsPath = new URL("../src/firebase/tenants.ts", import.meta.url);
const rulesPath = new URL("../firestore.rules", import.meta.url);

test("tenant document reads do not recursively authorize through the tenant document", async () => {
  const rules = await fs.readFile(rulesPath, "utf8");

  assert.match(
    rules,
    /match \/tenants\/\{tenantId\}[\s\S]*?allow read: if isPlatformAdmin\(\) \|\| hasActiveTenantMembership\(tenantId\);/,
  );

  const start = rules.indexOf("function hasActiveTenantMembership(tenantId)");
  const end = rules.indexOf("function hasTenantMembership(tenantId)", start);
  const block = rules.slice(start, end);

  assert.match(block, /tenantMemberships/);
  assert.doesNotMatch(block, /documents\/tenants\/\$\(tenantId\)/);
});

test("canonical paid subscription is resolved before the effective plan", async () => {
  const tenants = await fs.readFile(tenantsPath, "utf8");

  assert.match(tenants, /getTenantSubscriptions/);
  assert.match(tenants, /preferredSubscription/);
  assert.match(
    tenants,
    /const subscriptionPlanId =[\s\S]*?subscription\.planId/,
  );
  assert.match(
    tenants,
    /const effectivePlanId = subscriptionPlanId \|\| tenant\?\.planId \|\| null;/,
  );
});

test("legacy active plan documents do not fall back to Free Tutor solely because isActive is absent", async () => {
  const tenants = await fs.readFile(tenantsPath, "utf8");

  assert.match(
    tenants,
    /isActive: data\.isActive === true \|\| data\.status === "active"/,
  );
});

test("tenant provider preserves the resolved active subscription", async () => {
  const provider = await fs.readFile(providerPath, "utf8");

  assert.match(
    provider,
    /let resolvedSubscription = workspace\.subscription;/,
  );

  assert.match(
    provider,
    /setActiveSubscription\(resolvedSubscription\);/,
  );

  assert.match(
    provider,
    /resolvedSubscription\.status === "active"/,
  );

  assert.match(
    provider,
    /resolvedSubscription\.status === "trialing"/,
  );
});