# Medical Elites Platform v3.0.0 RC4 — Finance Core

This additive release introduces the Finance bounded context without changing the stable academic LMS.

## Included
- Pure finance domain models
- Double-entry journal validation
- Configurable revenue split calculation
- Domain event bus
- Compensating workflow engine
- Firestore repository adapter
- Finance dashboard and read-only operations pages
- Protected platform routes
- Trusted-server-only financial writes in Firestore rules
- Regression tests

## Security boundary
Browser clients may read finance records only through Platform Console authorization. Creation and mutation of subscriptions, wallets, journals, invoices, payments, coupons, commission rules and withdrawals are denied in Firestore Rules. Trusted Cloud Functions will own these writes in the payment batch.

## Deployment
Run `npm run release:check`, then deploy `firestore:rules,firestore:indexes,hosting`.
