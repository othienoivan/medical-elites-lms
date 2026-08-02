import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const rules = fs.readFileSync('storage.rules', 'utf8');
const service = fs.readFileSync('src/firebase/storage.tsx', 'utf8');
const firebaseConfig = fs.readFileSync('firebase.json', 'utf8');
const mirroredRules = fs.readFileSync('src/firebase/storage.rules', 'utf8');

test('firebase deploy configuration includes storage rules', () => {
  assert.match(firebaseConfig, /"storage"\s*:\s*\{\s*"rules"\s*:\s*"storage\.rules"/s);
});

test('new uploads use tenant or user owned namespaces', () => {
  assert.match(service, /tenants\/\$\{tenantId\}\/uploads\/\$\{user\.uid\}/);
  assert.match(service, /users\/\$\{user\.uid\}\/uploads/);
  assert.doesNotMatch(service, /const filePath = `\$\{folder\}\/\$\{safeFileName\}`/);
});

test('uploads carry ownership metadata and enforce client limits', () => {
  assert.match(service, /customMetadata/);
  assert.match(service, /uploaderUid/);
  assert.match(service, /MAX_UPLOAD_BYTES/);
  assert.match(service, /inferContentType/);
});

test('storage rules enforce tenant membership and uploader ownership', () => {
  assert.match(rules, /match \/tenants\/\{tenantId\}\/uploads\/\{uploaderUid\}/);
  assert.match(rules, /belongsToTenant\(tenantId\)/);
  assert.match(rules, /request\.auth\.uid == uploaderUid/);
  assert.match(rules, /hasTenantMetadata\(tenantId, uploaderUid\)/);
});

test('legacy upload roots are read-only and unknown paths are denied', () => {
  assert.match(rules, /allow create, update: if false;/);
  assert.match(rules, /match \/\{allPaths=\*\*\} \{\s*allow read, write: if false;/s);
});


test('deployable and mirrored storage rules are identical', () => {
  assert.equal(rules, mirroredRules);
});
