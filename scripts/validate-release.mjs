import { readFile, access } from "node:fs/promises";
import { constants } from "node:fs";
import { createHash } from "node:crypto";

const requiredFiles = [
  "firebase.json",
  "firestore.rules",
  "firestore.indexes.json",
  "src/firebase/firestore.rules",
  "src/firebase/firestore.indexes.json",
  "src/config/firebase.tsx",
  ".env.example",
  "storage.rules",
  "src/firebase/storage.rules",
  "functions/package.json",
  "functions/tsconfig.json",
  "functions/src/index.ts",
];

const failures = [];
for (const file of requiredFiles) {
  try { await access(file, constants.R_OK); }
  catch { failures.push(`Missing required release file: ${file}`); }
}

const pairs = [
  ["firestore.rules", "src/firebase/firestore.rules"],
  ["firestore.indexes.json", "src/firebase/firestore.indexes.json"],
  ["storage.rules", "src/firebase/storage.rules"],
];
for (const [canonical, mirror] of pairs) {
  const [a, b] = await Promise.all([readFile(canonical, "utf8"), readFile(mirror, "utf8")]);
  if (a !== b) failures.push(`${mirror} is out of sync with canonical ${canonical}`);
}

const firebase = JSON.parse(await readFile("firebase.json", "utf8"));
if (firebase?.firestore?.rules !== "firestore.rules") failures.push("firebase.json must deploy firestore.rules");
if (firebase?.firestore?.indexes !== "firestore.indexes.json") failures.push("firebase.json must deploy firestore.indexes.json");
if (firebase?.hosting?.public !== "dist") failures.push("firebase.json hosting.public must be dist");
if (firebase?.storage?.rules !== "storage.rules") failures.push("firebase.json must deploy storage.rules");
if (firebase?.functions?.source !== "functions") failures.push("firebase.json functions.source must be functions");

const rules = await readFile("firestore.rules", "utf8");
const requiredRuleFragments = [
  "match /notifications/{notificationId}",
  "allow delete: if false;",
  "match /notificationPreferences/{userUid}",
  "request.resource.data.diff(resource.data).affectedKeys().hasOnly",
  "match /auditLogs/{logId}",
];
for (const fragment of requiredRuleFragments) {
  if (!rules.includes(fragment)) failures.push(`Firestore rules missing required control: ${fragment}`);
}

const hash = createHash("sha256").update(rules).digest("hex").slice(0, 12);
if (failures.length) {
  console.error("\nRC1 release validation FAILED:\n- " + failures.join("\n- "));
  process.exit(1);
}
console.log(`RC1 release validation passed. Firestore rules fingerprint: ${hash}`);
