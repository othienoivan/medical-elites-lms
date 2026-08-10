import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("tenant document reads use membership-only authorization without a circular tenant lookup", async () => {
  const rules = await readFile("firestore.rules", "utf8");

  const start = rules.indexOf("function hasActiveTenantMembership(tenantId)");
  const end = rules.indexOf("function hasTenantMembership(tenantId)", start);
  const block = rules.slice(start, end);

  assert.match(block, /tenantMemberships/);
  assert.doesNotMatch(block, /documents\/tenants\/\$\(tenantId\)/);
  assert.match(
    rules,
    /allow read: if isPlatformAdmin\(\) \|\| hasActiveTenantMembership\(tenantId\)/,
  );
  assert.match(rules, /data\.status in \['trial', 'active'\]/);
});

test("paid plan activity is normalized from status or isActive", async () => {
  const source = await readFile("src/firebase/tenants.ts", "utf8");

  assert.ok(
    source.includes(
      'isActive: data.isActive === true || data.status === "active"',
    ),
  );

  assert.ok(source.includes("subscriptionPlanId"));
});

test("service worker only handles same-origin requests", async () => {
  const sw = await readFile("public/sw.js", "utf8");

  assert.match(sw, /url\.origin !== self\.location\.origin/);
  assert.match(sw, /Never intercept or cache Firebase/);
});