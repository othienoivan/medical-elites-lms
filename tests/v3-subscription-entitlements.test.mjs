import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("subscription administration uses trusted callable functions", async () => {
  const source = await read("functions/src/index.ts");
  for (const name of ["saveSubscriptionPlan", "assignTenantSubscription", "updateTenantSubscriptionStatus"]) {
    assert.match(source, new RegExp(`export const ${name}`));
  }
  assert.match(source, /assertPlatformSuperAdmin\(request\)/);
  assert.match(source, /platformAuditLogs/);
});

test("plans cannot be written directly by browser clients", async () => {
  const rules = await read("firestore.rules");
  assert.match(rules, /match \/plans\/\{documentId\}[\s\S]*allow create, update, delete: if false;/);
});

test("tenant subscription assignment updates tenant and immutable subscription records", async () => {
  const source = await read("functions/src/index.ts");
  assert.match(source, /db\.collection\("subscriptions"\)\.doc\(subscriptionId\)/);
  assert.match(source, /subscriptionStatus/);
  assert.match(source, /trialEndsAt/);
});

test("frontend exposes entitlement gate and trusted subscription admin client", async () => {
  const gate = await read("src/components/EntitlementGate.tsx");
  const client = await read("src/firebase/subscriptionAdmin.ts");
  assert.match(gate, /hasEntitlement/);
  assert.match(client, /saveSubscriptionPlan/);
  assert.match(client, /assignTenantSubscription/);
});
