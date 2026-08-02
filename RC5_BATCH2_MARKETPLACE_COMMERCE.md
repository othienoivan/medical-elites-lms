# Medical Elites Platform v3.0.0 RC5 Batch 2
## Cart, Orders, Checkout, Purchases and Automatic Enrolment

This release makes the marketplace transactional while reusing the hardened Flutterwave commerce and Finance domains.

## Delivered
- User-owned shopping carts and wishlists.
- Multi-product checkout with a single Flutterwave payment.
- Order history and payment status visibility.
- Server-issued product and commerce entitlements after verified payment.
- Purchase records and marketplace enrolment records.
- Automatic assignment of linked course units for course, course-unit and bundle products.
- Automatic product sales counters.
- Server-controlled financial and purchase writes.
- Idempotent checkout and webhook fulfilment.

## Important seller setup
To unlock academic content automatically, a marketplace product must contain the relevant course-unit IDs in `linkedResourceIds`. Products without linked resources still receive entitlement access but cannot assign academic course units automatically.

## Deployment
1. Preserve `.env.local` and Firebase secrets.
2. Run `npm install` and `npm run release:check`.
3. Build Functions with `cd functions && npm install && npm run build`.
4. Deploy with `firebase deploy --only functions,firestore:rules,firestore:indexes,hosting`.

## Rollback
Redeploy the prior RC5 Batch 1 package. Existing orders, entitlements and purchases should be retained for audit purposes; do not delete financial records during rollback.
