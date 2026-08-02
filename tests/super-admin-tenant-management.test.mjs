import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
const functions=fs.readFileSync("functions/src/index.ts","utf8"); const router=fs.readFileSync("src/routes/AppRouter.tsx","utf8"); const rules=fs.readFileSync("firestore.rules","utf8");
test("trusted tenant lifecycle functions are exported",()=>{for(const n of ["createTenant","updateTenantProfile","updateTenantStatus","assignTenantOwner"])assert.match(functions,new RegExp(`export const ${n}`));});
test("tenant detail route is registered",()=>assert.match(router,/platform\/tenants\/:tenantId/));
test("platform audit logs are immutable from browser clients",()=>{assert.match(rules,/match \/platformAuditLogs/);assert.match(rules,/allow create, update, delete: if false/);});
test("suspended tenants lose active membership access",()=>assert.match(rules,/data\.status in \['trial', 'active'\]/));
