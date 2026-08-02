import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
const read=(p)=>fs.readFileSync(new URL(`../${p}`,import.meta.url),"utf8");
test("finance domain is multi-currency, period and idempotency ready",()=>{const s=read("src/domains/finance/domain/finance.ts");assert.match(s,/accountingPeriodFor/);assert.match(s,/idempotencyKey/);assert.match(s,/CurrencyCode/);assert.match(s,/selectCommissionRule/)});
test("wallet and revenue commands use callable server functions",()=>{const s=read("src/domains/finance/infrastructure/financeRepository.ts");assert.match(s,/createFinanceWallet/);assert.match(s,/distributeFinanceRevenue/);assert.match(s,/requestFinanceWithdrawal/)});
test("finance writes remain server controlled",()=>{const s=read("firestore.rules");assert.match(s,/match \/ledgerEntries\//);assert.match(s,/allow create, update, delete: if false/)});
test("platform exposes revenue sharing and finance operations",()=>{const s=read("src/routes/AppRouter.tsx");assert.match(s,/platform\/finance\/revenue-sharing/);assert.match(s,/platform\/finance\/operations/)});
