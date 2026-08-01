import { access, readFile, readdir } from 'node:fs/promises';
import { constants } from 'node:fs';
import path from 'node:path';

const failures = [];
const required = [
  'storage.rules',
  'src/firebase/storage.rules',
  'functions/package.json',
  'functions/tsconfig.json',
  'functions/src/index.ts',
  '.gitignore',
  '.env.example',
  '.env.staging.example',
  '.firebaserc.example',
  'SOURCE_TREE_POLICY.md',
];

for (const file of required) {
  try { await access(file, constants.R_OK); }
  catch { failures.push(`Missing platform baseline file: ${file}`); }
}

const firebase = JSON.parse(await readFile('firebase.json', 'utf8'));
if (firebase?.storage?.rules !== 'storage.rules') failures.push('firebase.json must deploy storage.rules');
if (firebase?.functions?.source !== 'functions') failures.push('firebase.json functions.source must be functions');
if (!firebase?.emulators?.storage) failures.push('Storage emulator must be configured');
if (!firebase?.emulators?.firestore) failures.push('Firestore emulator must be configured');
if (!firebase?.emulators?.auth) failures.push('Auth emulator must be configured');

const [storageRules, storageMirror] = await Promise.all([
  readFile('storage.rules', 'utf8'),
  readFile('src/firebase/storage.rules', 'utf8'),
]);
if (storageRules !== storageMirror) failures.push('src/firebase/storage.rules is out of sync with storage.rules');

const forbiddenStorageFragments = [
  'allow read, write: if true',
  'request.time < timestamp.date',
];
for (const fragment of forbiddenStorageFragments) {
  if (storageRules.includes(fragment)) failures.push(`Storage rules contain unsafe fragment: ${fragment}`);
}

const requiredStorageFragments = [
  "match /tenants/{tenantId}/{allPaths=**}",
  "match /users/{userId}/{allPaths=**}",
  "allow read, write: if false;",
  "firestore.get(/databases/(default)/documents/users/$(request.auth.uid))",
];
for (const fragment of requiredStorageFragments) {
  if (!storageRules.includes(fragment)) failures.push(`Storage rules missing required control: ${fragment}`);
}

const gitignore = await readFile('.gitignore', 'utf8');
for (const fragment of ['.env', 'node_modules/', 'functions/lib/', '.firebase/']) {
  if (!gitignore.includes(fragment)) failures.push(`.gitignore missing ${fragment}`);
}

const sourceMirrorRoot = path.join('src', 'firebase', 'src');
try {
  const items = await readdir(sourceMirrorRoot);
  if (items.length === 0) failures.push('Legacy source mirror exists but is empty; remove it or preserve it intentionally');
} catch {
  // Mirror removal is allowed once all tests have migrated.
}

if (failures.length) {
  console.error('\nv3.0.0 RC1 platform baseline validation FAILED:\n- ' + failures.join('\n- '));
  process.exit(1);
}
console.log('v3.0.0 RC1 platform baseline validation passed.');
