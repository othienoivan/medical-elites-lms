import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), 'utf8');

test('firebase deploys production storage rules and configures emulators', async () => {
  const firebase = JSON.parse(await read('firebase.json'));
  assert.equal(firebase.storage.rules, 'storage.rules');
  assert.equal(firebase.functions.source, 'functions');
  assert.ok(firebase.emulators.auth);
  assert.ok(firebase.emulators.firestore);
  assert.ok(firebase.emulators.storage);
});

test('storage rules are default deny and never use expiring test mode', async () => {
  const rules = await read('storage.rules');
  assert.match(rules, /match \/tenants\/\{tenantId\}\/uploads\/\{uploaderUid\}\/\{folder\}\/\{fileName\}/);
  assert.match(rules, /match \/users\/\{userId\}\/uploads\/\{folder\}\/\{fileName\}/);
  assert.match(rules, /allow read, write: if false;/);
  assert.doesNotMatch(rules, /allow read, write: if true/);
  assert.doesNotMatch(rules, /request\.time\s*<\s*timestamp\.date/);
});

test('storage rules restrict legacy teaching uploads to tutor or admin roles', async () => {
  const rules = await read('storage.rules');
  assert.match(rules, /function isTutorOrAdmin\(\)/);
  assert.match(rules, /folder in \['images', 'pdfs', 'powerpoints', 'videos', 'audio', 'documents', 'lesson-resources'\]/);
  assert.match(rules, /allow create: if belongsToTenant\(tenantId\)[\s\S]*isTutorOrAdmin\(\)/);
  assert.match(rules, /allow create, update: if false;/);
});

test('functions source is restored and repository secrets are ignored', async () => {
  const [functionsSource, functionsPackage, ignore] = await Promise.all([
    read('functions/src/index.ts'),
    read('functions/package.json'),
    read('.gitignore'),
  ]);
  assert.match(functionsSource, /medicalElitesAi/);
  assert.match(functionsSource, /createDonationCheckout/);
  assert.match(functionsPackage, /firebase-functions/);
  assert.match(ignore, /\.env/);
  assert.match(ignore, /functions\/lib\//);
});
