import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("manual marking loads a single attempt through a trusted callable", async () => {
  const client = await read("src/firebase/quizAttempts.tsx");
  const backend = await read("functions/src/index.ts");
  assert.match(client, /getTutorAssessmentAttempt/);
  assert.match(backend, /export const getTutorAssessmentAttempt = onCall/);
  assert.match(backend, /tutorOwnsQuizData/);
});

test("tutor wallet reconciles historical marketplace revenue idempotently", async () => {
  const wallet = await read("src/pages/TutorWalletPage.tsx");
  const backend = await read("functions/src/index.ts");
  assert.match(wallet, /reconcileTutorMarketplaceRevenue/);
  assert.match(backend, /export const reconcileTutorMarketplaceRevenue = onCall/);
  assert.match(backend, /automaticallyDistributeMarketplaceRevenue/);
  assert.match(backend, /auto_marketplace_revenue_/);
});

test("tutor mobile layout mirrors the compact student navigation pattern", async () => {
  const layout = await read("src/components/layout/TutorLayout.tsx");
  assert.match(layout, /sticky top-0 z-30/);
  assert.match(layout, /Tutor mobile navigation/);
  assert.match(layout, /name: "Home"/);
  assert.match(layout, /name: "Teach"/);
  assert.match(layout, /name: "Assess"/);
  assert.match(layout, /name: "Sales"/);
});
