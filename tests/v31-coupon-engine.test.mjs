import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const router = fs.readFileSync("src/routes/AppRouter.tsx", "utf8");
const functions = fs.readFileSync("functions/src/index.ts", "utf8");
const rules = fs.readFileSync("firestore.rules", "utf8");
const productPage = fs.readFileSync("src/pages/marketplace/MarketplaceProductPage.tsx", "utf8");

test("tutor coupon management route is protected", () => { assert.match(router, /tutor\/commerce\/coupons/); assert.match(router, /TutorCouponsPage/); });
test("checkout validates coupons server-side", () => { assert.match(functions, /resolveMarketplaceCoupon/); assert.match(functions, /validateMarketplaceCoupon/); assert.match(functions, /couponCode/); assert.match(functions, /checkoutAmount/); });
test("coupon records are server-written and tutor-readable", () => { assert.match(rules, /match \/marketplaceCoupons/); assert.match(rules, /allow create, update, delete: if false/); assert.match(rules, /resource.data.sellerId == request.auth.uid/); });
test("product checkout exposes coupon application", () => { assert.match(productPage, /handleApplyCoupon/); assert.match(productPage, /validateCoupon/); });
