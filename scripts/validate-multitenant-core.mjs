import fs from "node:fs";
const required = [
  "src/models/Tenant.ts", "src/models/Plan.ts", "src/firebase/tenants.ts",
  "src/contexts/TenantContext.tsx", "src/utils/entitlements.ts",
  "src/pages/PlatformConsolePage.tsx", "config/default-plans.json",
];
for (const file of required) {
  if (!fs.existsSync(file)) throw new Error(`Missing multi-tenant core file: ${file}`);
}
const rules = fs.readFileSync("firestore.rules", "utf8");
for (const collection of ["tenants", "tenantMemberships", "plans", "subscriptions"]) {
  if (!rules.includes(`match /${collection}/`)) throw new Error(`Missing rules for ${collection}`);
}
console.log("Multi-tenant core validation passed.");
