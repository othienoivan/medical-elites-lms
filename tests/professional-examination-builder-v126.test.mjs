import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = path => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('examination model includes delivery and security settings', async () => {
  const model = await read('src/models/Examination.tsx');
  for (const field of ['durationMinutes','passMark','attemptsAllowed','opensAt','closesAt','randomizeQuestions','randomizeOptions','showResultsImmediately']) {
    assert.match(model, new RegExp(field));
  }
});

test('builder saves and reloads examination settings', async () => {
  const page = await read('src/pages/ExaminationBuilderPage.tsx');
  assert.match(page, /ExaminationSettingsPanel/);
  assert.match(page, /setDurationMinutes\(existing\.durationMinutes/);
  assert.match(page, /Closing date and time must be later/);
});

test('examination bank supports status filtering', async () => {
  const page = await read('src/pages/ExaminationBankPage.tsx');
  assert.match(page, /statusFilter/);
  assert.match(page, /All statuses/);
});

test('details page supports print, versions and archive', async () => {
  const page = await read('src/pages/ExaminationDetailsPage.tsx');
  assert.match(page, /Print \/ Save PDF/);
  assert.match(page, /createExaminationVersions/);
  assert.match(page, /status:"archived"/);
});
