import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const router = fs.readFileSync("src/routes/AppRouter.tsx", "utf8");
const page = fs.readFileSync("src/pages/marketplace/MarketplaceSellerPage.tsx", "utf8");
const dashboard = fs.readFileSync("src/pages/marketplace/TutorCommerceDashboardPage.tsx", "utf8");

test("public tutor storefront route is registered", () => {
  assert.match(router, /path="\/store\/:sellerId"/);
});

test("storefront supports featured products, search and type filtering", () => {
  assert.match(page, /Featured products/);
  assert.match(page, /Search this store/);
  assert.match(page, /typeFilter/);
  assert.match(page, /product\.status === "published"/);
});

test("tutor commerce dashboard links to public storefront", () => {
  assert.match(dashboard, /My Storefront/);
  assert.match(dashboard, /\/store\/(?:me|\$\{[^}]+\})/);
});
