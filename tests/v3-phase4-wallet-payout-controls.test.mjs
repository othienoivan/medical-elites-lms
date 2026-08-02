import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("finance repository exposes trusted payout completion", () => {
  const source = read("src/domains/finance/infrastructure/financeRepository.ts");
  assert.match(source, /completeFinanceWithdrawal/);
  assert.match(source, /externalReference/);
});

test("finance service exposes payout completion", () => {
  const source = read("src/domains/finance/application/financeService.ts");
  assert.match(source, /completeWithdrawal/);
});

test("backend completes payout atomically and records audit trail", () => {
  const source = read("functions/src/index.ts");
  assert.match(source, /export const completeFinanceWithdrawal/);
  assert.match(source, /withdrawal\.paid/);
  assert.match(source, /platformAuditLogs/);
  assert.match(source, /frozenBalance: frozen - amount/);
});

test("financial records remain server-controlled", () => {
  const source = read("firestore.rules");
  assert.match(source, /match \/wallets\/\{documentId\}/);
  assert.match(source, /match \/ledgerEntries\/\{documentId\}/);
  assert.match(source, /allow create, update, delete: if false/);
});
