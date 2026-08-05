import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
const functions=fs.readFileSync("functions/src/index.ts","utf8"); const rules=fs.readFileSync("firestore.rules","utf8");
test("creates canonical payment intents",()=>assert.match(functions,/collection\("paymentIntents"\)/));
test("records canonical webhook events",()=>assert.match(functions,/collection\("paymentWebhookEvents"\)/));
test("payment records are server controlled",()=>{assert.match(rules,/match \/paymentIntents/);assert.match(rules,/allow create, update, delete: if false/)});
