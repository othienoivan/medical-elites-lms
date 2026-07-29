import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Phase 5 ERP routes are registered and protected', async () => {
  const router = await readFile(new URL('../src/routes/AppRouter.tsx', import.meta.url), 'utf8');
  for (const route of ['/tutor/erp','/tutor/osce','/tutor/quality-assurance','/tutor/institutional-analytics']) {
    assert.match(router, new RegExp(route.replaceAll('/','\\/')));
  }
  assert.match(router, /ErpCommandCentrePage/);
  assert.match(router, /OsceManagerPage/);
});

test('Phase 5 collections have explicit Firestore rules', async () => {
  const rules = await readFile(new URL('../firestore.rules', import.meta.url), 'utf8');
  assert.match(rules, /match \/osceStations\/\{documentId\}/);
  assert.match(rules, /match \/qualityAssuranceItems\/\{documentId\}/);
  assert.doesNotMatch(rules, /osceStations[\s\S]{0,300}allow write: if signedIn\(\)/);
});
