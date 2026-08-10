# Tutor Storefront Save Hotfix

Fixes storefront saves failing when optional SellerProfile fields are undefined.

## Changes
- Sanitizes SellerProfile recursively before Firestore writes.
- Validates sellerId and ownerUid before writing.
- Preserves ownerUid required by Firestore Rules.
- Keeps existing merge behavior.

## Deploy
npm run typecheck
npm test
npm run release:check
firebase deploy --only hosting
