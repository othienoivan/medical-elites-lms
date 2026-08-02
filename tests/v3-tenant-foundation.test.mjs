import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("application resolves a tenant workspace after authentication", async () => {
  const main = await read("src/main.tsx");
  assert.match(main, /TenantProvider/);
  assert.match(main, /<AuthProvider>[\s\S]*<TenantProvider>[\s\S]*<App/);
});

test("access scope carries canonical tenant context with institution compatibility", async () => {
  const scope = await read("src/firebase/accessScope.ts");
  const hook = await read("src/hooks/useAccessScope.ts");
  assert.match(scope, /tenantId\?: string/);
  assert.match(scope, /tenantType\?: TenantType/);
  assert.match(scope, /tenantRoles\?: TenantRole\[\]/);
  assert.match(scope, /recordTenantId/);
  assert.match(hook, /activeTenant\?\.id \?\? userProfile\?\.institutionId/);
  assert.match(hook, /legacyInstitutionId/);
});

test("tenant workspace bootstrap is idempotent and server controlled", async () => {
  const functions = await read("functions/src/index.ts");
  assert.match(functions, /export const bootstrapTenantWorkspace = onCall/);
  assert.match(functions, /tenantId = institutionId \|\| `tutor_\$\{uid\}`/);
  assert.match(functions, /membershipId = `\$\{tenantId\}_\$\{uid\}`/);
  assert.match(functions, /FieldValue\.arrayUnion\(tenantId\)/);
  assert.match(functions, /createdTenant: !tenantSnapshot\.exists/);
});

test("tenant rules isolate workspaces and prevent browser role escalation", async () => {
  const rules = await read("firestore.rules");
  assert.match(rules, /function hasTenantMembership/);
  assert.match(rules, /function canManageTenant/);
  assert.match(rules, /match \/tenantMemberships\/\{membershipId\}/);
  assert.match(rules, /allow create, update, delete: if isPlatformAdmin\(\)/);
  assert.match(rules, /match \/tenants\/\{tenantId\}/);
  assert.match(rules, /allow read: if isPlatformAdmin\(\) \|\| hasTenantMembership\(tenantId\)/);
});

test("tenant membership lookup has a composite index", async () => {
  const indexes = JSON.parse(await read("firestore.indexes.json"));
  assert.ok(indexes.indexes.some((index) =>
    index.collectionGroup === "tenantMemberships"
    && index.fields.some((field) => field.fieldPath === "userId")
    && index.fields.some((field) => field.fieldPath === "status")
  ));
});
