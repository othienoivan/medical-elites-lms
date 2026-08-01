import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");

test("RC5 Final marketplace intelligence models and services exist", async () => {
  const [models, service] = await Promise.all([read("src/domains/marketplace/domain/intelligence.ts"), read("src/domains/marketplace/application/marketplace-intelligence-service.ts")]);
  assert.match(models, /interface ProductReview/);
  assert.match(models, /interface MarketplaceCoupon/);
  assert.match(models, /interface FraudSignal/);
  assert.match(service, /listRecommendations/);
});

test("verified reviews and operations are server controlled", async () => {
  const [functions, rules] = await Promise.all([read("functions/src/index.ts"), read("firestore.rules")]);
  assert.match(functions, /submitMarketplaceReview/);
  assert.match(functions, /Only verified purchasers may review/);
  assert.match(functions, /moderateMarketplaceReview/);
  assert.match(rules, /match \/productReviews\//);
  assert.match(rules, /allow create, update, delete: if false/);
});

test("marketplace intelligence and operations routes are protected", async () => {
  const router = await read("src/routes/AppRouter.tsx");
  assert.match(router, /\/platform\/marketplace\/intelligence/);
  assert.match(router, /\/platform\/marketplace\/operations/);
  assert.match(router, /PlatformAccessGate/);
  assert.match(router, /\/marketplace\/seller-analytics/);
});

test("RC5 Final indexes avoid unnecessary single-field audit index", async () => {
  const indexes = JSON.parse(await read("firestore.indexes.json"));
  assert.ok(indexes.indexes.some((item) => item.collectionGroup === "productReviews"));
  assert.ok(indexes.indexes.some((item) => item.collectionGroup === "recentlyViewed"));
  assert.equal(indexes.indexes.some((item) => item.collectionGroup === "auditLogs" && item.fields.length === 1), false);
});
