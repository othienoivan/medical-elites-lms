import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const layout = fs.readFileSync('src/components/layout/TutorLayout.tsx', 'utf8');
const router = fs.readFileSync('src/routes/AppRouter.tsx', 'utf8');
const dashboard = fs.readFileSync('src/pages/TutorDashboardPage.tsx', 'utf8');
const lessons = fs.readFileSync('src/pages/LessonManagerPage.tsx', 'utf8');

test('Lesson Builder is not listed in tutor sidebar', () => {
  assert.ok(!layout.includes('{ name: "Lesson Builder", icon: FileEdit, path: "/tutor/lessons/builder" }'));
});

test('legacy builder route redirects to lesson list', () => {
  assert.match(router, /path="\/tutor\/lessons\/builder"[\s\S]*?<Navigate to="\/tutor\/lessons" replace \/>/);
});

test('contextual lesson builder route remains available', () => {
  assert.ok(router.includes('path="/tutor/lessons/:lessonId/builder"'));
});

test('lesson manager remains the entry point to builder', () => {
  assert.ok(lessons.includes('Open Builder'));
  assert.ok(lessons.includes('`/tutor/lessons/${lesson.id}/builder`'));
});

test('dashboard no longer links directly to orphan builder route', () => {
  assert.ok(!dashboard.includes('["Lesson Builder", "/tutor/lessons/builder"]'));
});
