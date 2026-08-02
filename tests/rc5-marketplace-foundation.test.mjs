import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("marketplace bounded context and public routes exist", async () => {
  const router = await read("src/routes/AppRouter.tsx");
  const domain = await read("src/domains/marketplace/domain/models.ts");
  assert.match(router, /path="\/marketplace"/);
  assert.match(router, /path="\/marketplace\/products\/:productId"/);
  assert.match(router, /path="\/marketplace\/sell"/);
  assert.match(domain, /ProductEntitlement/);
  assert.match(domain, /institution_license/);
});

test("seller writes are ownership-scoped and publication is platform controlled", async () => {
  const rules = await read("firestore.rules");
  assert.match(rules, /match \/marketplaceProducts\/\{productId\}/);
  assert.match(rules, /request\.resource\.data\.sellerId == request\.auth\.uid/);
  assert.match(rules, /request\.resource\.data\.status in \['draft', 'submitted'\]/);
  assert.match(rules, /resource\.data\.status == 'published'/);
});

test("marketplace queries have composite indexes", async () => {
  const indexes = JSON.parse(await read("firestore.indexes.json"));
  const productIndexes = indexes.indexes.filter((item) => item.collectionGroup === "marketplaceProducts");
  assert.ok(productIndexes.length >= 4);
  assert.ok(!indexes.indexes.some((item) => item.collectionGroup === "auditLogs" && item.fields.length === 1));
});

test("platform marketplace moderation is isolated from academic LMS", async () => {
  const layout = await read("src/components/platform/PlatformLayout.tsx");
  const page = await read("src/pages/platform/PlatformMarketplacePage.tsx");
  assert.match(layout, /\/platform\/marketplace/);
  assert.match(page, /Marketplace Operations/);
  assert.match(page, /Publish/);
});
