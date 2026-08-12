import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
const functions = fs.readFileSync("functions/src/institutionTutors.ts", "utf8");
const page = fs.readFileSync("src/pages/AdminTutorsPage.tsx", "utf8");
test("admin tutor directory is tenant-membership scoped",()=>{assert.match(functions,/getInstitutionTutorMemberships/);assert.match(functions,/where\("tenantId", "==", tenantId\)/);assert.doesNotMatch(page,/getTutorAccounts/);});
test("remove from institution preserves platform account",()=>{assert.match(functions,/removeTutorFromInstitution/);assert.match(functions,/independentTenantId = `tutor_\$\{tutorUid\}`/);assert.match(functions,/accountPreserved: true/);assert.match(functions,/institutionId: FieldValue\.delete\(\)/);});
test("institution access changes membership only",()=>{assert.match(functions,/setInstitutionTutorAccess/);assert.doesNotMatch(page,/setUserActive/);});
