import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('assessment workspace contains no placeholder alerts', async () => {
  const source = await read('src/pages/AssessmentWorkspacePage.tsx');
  assert.doesNotMatch(source, /coming next|coming soon/i);
  assert.doesNotMatch(source, /alert\(/);
  assert.match(source, /\/tutor\/quizzes\/builder\?type=assignment/);
  assert.match(source, /\/tutor\/questions\/new\?mode=ai/);
});

test('student dashboard has no inactive coming-soon card', async () => {
  const source = await read('src/pages/DashboardPage.tsx');
  assert.doesNotMatch(source, /Coming soon/i);
});

test('print workflows replace unfinished export actions', async () => {
  const analytics = await read('src/pages/QuizAnalyticsPage.tsx');
  const profile = await read('src/pages/StudentProfilePage.tsx');
  assert.match(analytics, /window\.print\(\)/);
  assert.match(profile, /window\.print\(\)/);
});
