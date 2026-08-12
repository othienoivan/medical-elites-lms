import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const lessonManager = fs.readFileSync("src/pages/LessonManagerPage.tsx", "utf8");
const lessons = fs.readFileSync("src/firebase/lessons.tsx", "utf8");
const dashboard = fs.readFileSync("src/pages/platform/PlatformDashboardPage.tsx", "utf8");
const plans = fs.readFileSync("src/pages/platform/PlatformPlansPage.tsx", "utf8");
const functions = fs.readFileSync("functions/src/index.ts", "utf8");

test("lesson manager supports consolidated lesson details editing and delete", () => {
  assert.match(lessonManager, /Edit Lesson Details/);
  assert.match(lessonManager, /Lesson number/);
  assert.match(lessonManager, /Publication status/);
  assert.match(lessonManager, /Save changes/);
  assert.match(lessonManager, /Delete Lesson/);
  assert.match(lessons, /export async function deleteLesson/);
  assert.match(lessons, /export async function moveLessonToModule/);
  assert.match(lessons, /export async function updateLesson/);
});

test("platform dashboard uses trusted live snapshot", () => {
  assert.match(dashboard, /getPlatformOverviewSnapshot/);
  assert.match(functions, /export const getPlatformOverviewSnapshot/);
  assert.match(functions, /commerceOrders/);
  assert.match(functions, /marketplaceProducts/);
  assert.match(functions, /grossCommerceRevenue/);
});

test("created plans are loaded through trusted platform control", () => {
  assert.match(plans, /listSubscriptionPlansTrusted/);
  assert.match(functions, /export const listSubscriptionPlansTrusted/);
  assert.match(plans, /Loading created plans/);
});
