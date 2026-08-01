import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('platform access requires an explicit platform role', async () => {
  const rules = await read('firestore.rules');
  assert.match(rules, /data\.keys\(\)\.hasAny\(\['platformRole'\]\)/);
  assert.doesNotMatch(rules, /!userDocument\(\)\.data\.keys\(\)\.hasAny\(\['platformRole'\]\)/);
});

test('operational security collections are server only', async () => {
  const rules = await read('firestore.rules');
  assert.match(rules, /match \/functionRateLimits\/\{documentId\}/);
  assert.match(rules, /match \/webhookReceipts\/\{documentId\}/);
  assert.match(rules, /allow read, create, update, delete: if false/);
});

test('AI modes have role authorization and rate limiting', async () => {
  const source = await read('functions/src/index.ts');
  assert.match(source, /MODE_ROLES/);
  assert.match(source, /consumeRateLimit/);
  assert.match(source, /tutor_questions: \["tutor", "admin"\]/);
  assert.doesNotMatch(source, /AI analysis failed: \$\{message/);
});

test('Flutterwave webhook uses timing-safe legacy verification and receipt idempotency', async () => {
  const source = await read('functions/src/index.ts');
  assert.match(source, /timingSafeEqual\(Buffer\.from\(legacyVerificationHash\)/);
  assert.match(source, /collection\("webhookReceipts"\)/);
  assert.match(source, /if \(!txRef \|\| !transactionId\)/);
});

test('Storage validates tenant and user upload content types', async () => {
  const rules = await read('storage.rules');
  assert.match(rules, /validAllowedUpload\(\)/);
  assert.match(rules, /validImage\(\) \|\| validDocument\(\)/);
});

test('Hosting provides baseline browser security headers', async () => {
  const config = JSON.parse(await read('firebase.json'));
  const headers = config.hosting.headers.flatMap((entry) => entry.headers ?? []);
  const names = new Set(headers.map((header) => header.key));
  for (const required of ['X-Content-Type-Options', 'Referrer-Policy', 'Permissions-Policy', 'X-Frame-Options']) {
    assert.equal(names.has(required), true, `${required} missing`);
  }
});
