import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('all authenticated sidebars expose the Donate route', async () => {
  for (const file of ['src/components/layout/StudentLayout.tsx','src/components/layout/TutorLayout.tsx','src/components/layout/AdminLayout.tsx']) {
    assert.match(await read(file), /\/donate/);
  }
  assert.match(await read('src/routes/AppRouter.tsx'), /path="\/donate"/);
});

test('rich text editor enables working lists and expanded formatting', async () => {
  const editor = await read('src/components/editor/RichTextEditor.tsx');
  const css = await read('src/index.css');
  assert.match(editor, /toggleBulletList/);
  assert.match(editor, /toggleOrderedList/);
  assert.match(editor, /sinkListItem/);
  assert.match(editor, /toggleUnderline/);
  assert.match(editor, /setLink/);
  assert.match(css, /list-style-type: disc/);
  assert.match(css, /list-style-type: decimal/);
});

test('module editing preserves course-unit context and module cards use actual lesson records', async () => {
  const edit = await read('src/pages/EditModulePage.tsx');
  const manager = await read('src/pages/ModuleManagerPage.tsx');
  assert.match(edit, /courseUnitId/);
  assert.match(edit, /modulesRoute/);
  assert.match(manager, /getLessons\(module\.id, scope, true\)/);
  assert.match(manager, /lessonCounts\[module\.id\]/);
});

test('donations use trusted backend checkout and verified idempotent webhooks', async () => {
  const client = await read('src/firebase/donations.tsx');
  const functions = await read('functions/src/index.ts');
  const rules = await read('firestore.rules');
  assert.match(client, /httpsCallable/);
  assert.match(functions, /createDonationCheckout/);
  assert.match(functions, /createHmac\("sha256"/);
  assert.match(functions, /transactions\/\$\{encodeURIComponent\(transactionId\)\}\/verify/);
  assert.match(functions, /Already processed/);
  assert.match(rules, /match \/donations\/\{documentId\}/);
  assert.match(rules, /allow create, update, delete: if false/);
});
