import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('cart and wishlist rules do not dereference request.resource on reads', () => {
  const rules = read('firestore.rules');
  assert.match(rules, /match \/marketplaceCarts\/\{customerUid\}[\s\S]*allow read, delete: if signedIn\(\)/);
  assert.match(rules, /match \/marketplaceWishlists\/\{customerUid\}[\s\S]*allow read, delete: if signedIn\(\)/);
});

test('tutor product management has a dedicated edit route', () => {
  const routes = read('src/routes/AppRouter.tsx');
  const products = read('src/pages/marketplace/TutorProductsPage.tsx');
  assert.match(routes, /\/tutor\/commerce\/products\/:productId\/edit/);
  assert.match(products, /\/tutor\/commerce\/products\/\$\{p\.id\}\/edit/);
});

test('checkout reports a safe gateway error and logs diagnostic context', () => {
  const functions = read('functions/src/index.ts');
  assert.match(functions, /Flutterwave checkout initialization failed/);
  assert.match(functions, /Unable to create payment checkout: \$\{safeMessage\}/);
});
