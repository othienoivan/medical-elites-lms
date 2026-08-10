import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("tutor assessment workspace uses trusted legacy-compatible loader", async () => {
  const hook = await read("src/firebase/quizAttempts.tsx");
  const functions = await read("functions/src/index.ts");
  assert.match(hook, /getTutorAssessmentAttempts/);
  assert.match(functions, /export const getTutorAssessmentAttempts = onCall/);
  assert.match(functions, /where\("quizId", "in", ids\)/);
});

test("manual marking is trusted and tutor ownership is verified", async () => {
  const client = await read("src/firebase/quizAttempts.tsx");
  const functions = await read("functions/src/index.ts");
  assert.match(client, /saveTutorAssessmentMarking/);
  assert.match(functions, /export const saveTutorAssessmentMarking = onCall/);
  assert.match(functions, /This submission does not belong to you/);
});

test("marketplace seller analytics derives verified purchase figures", async () => {
  const page = await read("src/pages/marketplace/MarketplaceSellerAnalyticsPage.tsx");
  const functions = await read("functions/src/index.ts");
  assert.match(page, /getTutorMarketplaceAnalytics/);
  assert.match(page, /Verified sales/);
  assert.match(functions, /marketplacePurchases/);
  assert.match(functions, /revenueByCurrency/);
});

test("tutor wallet exposes ledger-backed earnings activity", async () => {
  const wallet = await read("src/pages/TutorWalletPage.tsx");
  const repo = await read("src/domains/finance/infrastructure/financeRepository.ts");
  assert.match(wallet, /Recent earnings activity/);
  assert.match(wallet, /listOwnerLedgerEntries/);
  assert.match(repo, /listOwnerLedgerEntries/);
});
