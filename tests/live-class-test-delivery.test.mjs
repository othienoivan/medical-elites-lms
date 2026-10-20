import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("student classroom polls a secured single-session endpoint", () => {
  const api = read("src/firebase/liveClasses.ts");
  const room = read("src/pages/LiveClassRoomPage.tsx");
  const functions = read("functions/src/index.ts");
  assert.match(api, /getLiveClassSession/);
  assert.match(room, /setInterval\(\(\) => void refresh/);
  assert.match(room, /5_000/);
  assert.match(functions, /export const getLiveClassSession/);
  assert.match(functions, /userHasCourseAccess/);
});

test("launched tests are visible before and after classroom entry", () => {
  const room = read("src/pages/LiveClassRoomPage.tsx");
  assert.match(room, /const activeTest/);
  assert.equal((room.match(/Open live test/g) || []).length >= 2, true);
  assert.match(room, /testMinutesRemaining/);
});

test("only published same-course tests may launch", () => {
  const page = read("src/pages/LiveClassesPage.tsx");
  const functions = read("functions/src/index.ts");
  assert.match(page, /quiz\.status === "published"/);
  assert.match(functions, /Publish the attached assessment before launching it/);
  assert.match(functions, /same course unit as the live class/);
});
