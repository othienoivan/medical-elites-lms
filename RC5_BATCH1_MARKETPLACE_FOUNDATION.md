# Medical Elites Platform v3.0.0 RC5 Batch 1

## Delivered

- Marketplace bounded context and domain contracts
- Public catalogue and product detail pages
- Public seller storefronts
- Tutor/admin product builder
- Platform moderation centre
- Institution-aware seller and product ownership
- Multi-currency prices
- Product lifecycle and access entitlement models
- Firestore rules and composite indexes
- Regression tests and deployment guidance

## Deployment

```powershell
npm install
npm run release:check
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

## Rollback

Redeploy the previous RC4.3 Hosting build and prior Firestore rules/indexes. Marketplace collections are additive and do not modify academic records.

## Important

The Buy button is intentionally non-operational in Batch 1. Checkout, carts, orders, purchase entitlements, and automatic enrollment arrive in RC5 Batch 2.
