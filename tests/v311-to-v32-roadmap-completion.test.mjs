import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function readSource(path) {
  return readFile(new URL(`../${path}`, import.meta.url), "utf8");
}

test("student learning library is routed and loads active owned products", async () => {
  const [routes, page] = await Promise.all([
    readSource("src/routes/AppRouter.tsx"),
    readSource("src/pages/marketplace/StudentLearningLibraryPage.tsx"),
  ]);

  assert.match(routes, /path="\/student\/library"/);
  assert.match(routes, /StudentLearningLibraryPage/);
  assert.match(page, /MarketplaceCommerceService\.listPurchases\(/);
  assert.match(page, /purchase\.status === "active"/);
  assert.match(page, /MarketplaceService\.getProduct\(/);
  assert.match(page, /productDestination\(/);
  assert.match(page, /My Learning Library/);
  assert.match(page, /Owned/);
});

test("student marketplace navigation exposes professional commerce destinations", async () => {
  const layout = await readSource("src/components/layout/StudentLayout.tsx");

  for (const route of [
    "/student/marketplace",
    "/student/purchases",
    "/student/library",
    "/student/wishlist",
  ]) {
    assert.ok(layout.includes(route), `Missing student navigation route: ${route}`);
  }
});

test("fulfilled orders expose access to owned learning", async () => {
  const page = await readSource("src/pages/marketplace/MarketplaceOrdersPage.tsx");

  assert.match(page, /fulfilled/);
  assert.match(page, /\/student\/library/);
  assert.match(page, /Open Library|View Product|Open Product/);
});

test("global search is registered and exposed by shared header actions", async () => {
  const [routes, headerActions] = await Promise.all([
    readSource("src/routes/AppRouter.tsx"),
    readSource("src/components/HeaderActions.tsx"),
  ]);

  assert.match(routes, /path="\/search"/);
  assert.match(routes, /GlobalSearchPage/);
  assert.match(headerActions, /\/search/);
});

test("commerce asset compatibility validates bundle ownership and eligibility", async () => {
  const [domainIndex, assetModel, assetService] = await Promise.all([
    readSource("src/domains/marketplace/index.ts"),
    readSource("src/domains/marketplace/domain/commerceAsset.ts"),
    readSource("src/domains/marketplace/application/commerce-asset-service.ts"),
  ]);

  assert.match(domainIndex, /commerceAsset|commerce-asset/);
  assert.match(assetModel, /interface CommerceAsset/);
  assert.match(assetModel, /CommerceAssetType/);
  assert.match(assetService, /marketplaceProductToCommerceAsset/);
  assert.match(assetService, /validateBundle/);
  assert.match(assetService, /at least two unique products/);
  assert.match(assetService, /sellerId/);
  assert.match(assetService, /status !== "published"/);
});
