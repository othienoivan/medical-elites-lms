import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('course-unit merge and delete use permission-scoped linked-record queries', async () => {
  const source = await read('src/firebase/courseUnits.tsx');
  assert.match(source, /getManagedLinkedDocuments/);
  assert.match(source, /where\("ownerUserId", "==", access\.uid\)/);
  assert.match(source, /where\("assignedTutorIds", "array-contains", access\.uid\)/);
  assert.doesNotMatch(source, /getDocs\(query\(collection\(db, "modules"\), where\("courseUnitId", "==", sourceId\)\)\)/);
});

test('visual lesson builder accepts multiple objectives and removes raw preview data control', async () => {
  const renderer = await read('src/components/editor/LessonBlockRenderer.tsx');
  const builder = await read('src/pages/LessonBuilderPage.tsx');
  assert.match(renderer, /Enter multiple objectives, one per line/);
  assert.match(renderer, /<textarea/);
  assert.doesNotMatch(builder, /Lesson Data Preview/);
  assert.doesNotMatch(builder, /Preview Data/);
});

test('PowerPoint resources are download-only and do not use browser preview', async () => {
  const viewer = await read('src/components/lesson/LessonViewer.tsx');
  assert.match(viewer, /Download PowerPoint/);
  assert.match(viewer, /Browser preview has been disabled/);
  const powerPointBlock = viewer.match(/block\.type === "powerpoint"[\s\S]*?block\.type === "document"/)?.[0] ?? "";
  assert.doesNotMatch(powerPointBlock, /OfficeDocumentViewer/);
  assert.doesNotMatch(powerPointBlock, /iframe/);
});
