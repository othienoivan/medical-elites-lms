import test from "node:test"; import assert from "node:assert/strict"; import { readFile } from "node:fs/promises";
test("finance bounded context is present", async()=>{const source=await readFile("src/domains/finance/domain/finance.ts","utf8");assert.match(source,/assertBalancedJournal/);assert.match(source,/splitRevenue/);});
test("finance routes are protected by platform gate",async()=>{const source=await readFile("src/routes/AppRouter.tsx","utf8");assert.match(source,/\/platform\/finance/);assert.match(source,/PlatformAccessGate><FinanceDashboardPage/);});
test("finance writes are server controlled",async()=>{const rules=await readFile("firestore.rules","utf8");assert.match(rules,/match \/journals\//);assert.match(rules,/allow create, update, delete: if false/);});
test("platform sidebar exposes finance centre",async()=>{const source=await readFile("src\/components\/platform\/PlatformLayout.tsx","utf8");assert.match(source,/Finance Centre/);});
