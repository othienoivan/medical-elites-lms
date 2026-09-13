import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const lessonManager = fs.readFileSync("src/pages/LessonManagerPage.tsx", "utf8");
const auth = fs.readFileSync("src/firebase/auth.tsx", "utf8");
const login = fs.readFileSync("src/pages/LoginPage.tsx", "utf8");
const functions = fs.readFileSync("functions/src/index.ts", "utf8");

test("lesson manager filters and sorts lessons by course unit", () => {
  assert.match(lessonManager, /courseUnitFilter/);
  assert.match(lessonManager, /All course units/);
  assert.match(lessonManager, /module\.courseUnitId \?\? module\.courseId/);
  assert.match(lessonManager, /courseUnitTitle/);
});

test("login supports Firebase password reset", () => {
  assert.match(auth, /sendPasswordResetEmail/);
  assert.match(auth, /export const resetPassword/);
  assert.match(login, /Forgot password\?/);
  assert.match(login, /handleForgotPassword/);
});

test("academic publication notifications support lesson assessment examination and assignment", () => {
  assert.match(functions, /notifyStudentsWhenLessonPublished/);
  assert.match(functions, /notifyStudentsWhenAssessmentPublished/);
  assert.match(functions, /notifyStudentsWhenExaminationPublished/);
  assert.match(functions, /notifyStudentsWhenAssignmentPublished/);
  assert.doesNotMatch(functions, /RESEND_API_KEY/);
  assert.doesNotMatch(functions, /AFRICASTALKING_API_KEY/);
  assert.doesNotMatch(functions, /api\.resend\.com/);
  assert.doesNotMatch(functions, /api\.africastalking\.com/);
  assert.match(functions, /notificationPreferences/);
  assert.match(functions, /deliveryChannels: \["firebase_in_app"\]/);
  assert.match(functions, /notificationDeliveries/);
});
