import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("marketplace cart, wishlist, orders and checkout routes are registered", async () => {
  const router = await read("src/routes/AppRouter.tsx");
  for (const route of ["/marketplace/cart", "/marketplace/wishlist", "/marketplace/orders", "/marketplace/checkout"]) assert.match(router, new RegExp(route.replaceAll("/", "\\/")));
});

test("marketplace commerce is handled through a trusted callable", async () => {
  const functions = await read("functions/src/index.ts");
  assert.match(functions, /export const createMarketplaceCartCheckout/);
  assert.match(functions, /marketplacePurchases/);
  assert.match(functions, /marketplaceEnrollments/);
  assert.match(functions, /productEntitlements/);
  assert.match(functions, /assignedCourseUnitIds: FieldValue\.arrayUnion/);
});

test("cart and wishlist are user-owned while purchases and enrolments are server written", async () => {
  const rules = await read("firestore.rules");
  assert.match(rules, /match \/marketplaceCarts\/\{customerUid\}/);
  assert.match(rules, /match \/marketplaceWishlists\/\{customerUid\}/);
  assert.match(rules, /match \/marketplacePurchases\/\{purchaseId\}/);
  assert.match(rules, /match \/marketplaceEnrollments\/\{enrollmentId\}/);
  assert.match(rules, /marketplacePurchases[\s\S]*allow create, update, delete: if false/);
});

test("marketplace indexes omit unnecessary single field audit index", async () => {
  const indexes = JSON.parse(await read("firestore.indexes.json"));
  assert.equal(indexes.indexes.some((index) => index.collectionGroup === "auditLogs" && index.fields.length === 1), false);
  assert.equal(indexes.indexes.some((index) => index.collectionGroup === "commerceOrders" && index.fields.some((field) => field.fieldPath === "purpose")), true);
});
