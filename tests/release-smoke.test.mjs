import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

test("deployable and mirrored Firestore rules are identical", async () => {
  const root = await readFile("firestore.rules", "utf8");
  const mirror = await readFile("src/firebase/firestore.rules", "utf8");
  assert.equal(mirror, root);
});

test("notification recipients cannot delete notifications", async () => {
  const rules = await readFile("firestore.rules", "utf8");
  const start = rules.indexOf("match /notifications/{notificationId}");
  const end = rules.indexOf("match /notificationPreferences/{userUid}", start);
  const block = rules.slice(start, end);
  assert.match(block, /allow delete: if false;/);
  assert.match(block, /affectedKeys\(\)\.hasOnly/);
  assert.match(block, /'isRead'.*'readAt'.*'isPinned'.*'isArchived'.*'archivedAt'/s);
});

test("Firebase hosting uses immutable assets and uncached HTML", async () => {
  const firebase = JSON.parse(await readFile("firebase.json", "utf8"));
  const headers = firebase.hosting.headers;
  assert.ok(headers.some(item => item.source.includes("js|css") && item.headers.some(h => h.value.includes("immutable"))));
  assert.ok(headers.some(item => item.source === "/index.html" && item.headers.some(h => h.value === "no-cache")));
});
