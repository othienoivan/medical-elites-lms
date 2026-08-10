# v3.1.2 Subscription & Entitlements Engine — Phase 3

## Scope
- Canonical paid tutor plans resolve from `plans` with legacy `financePlans` fallback.
- Subscription checkout binds to the tutor's active tenant workspace.
- Verified Flutterwave payments activate or renew the canonical tenant subscription.
- Tenant `planId` and `subscriptionStatus` update after verified payment.
- Subscription history is recorded for activation, renewal, cancellation, and expiry.
- Existing legacy subscription documents are migrated into the canonical tenant subscription on refresh.
- Expired paid subscriptions fall back to `tutor_free` while keeping the tenant/account active.
- Duplicate same-plan purchases are blocked until the final 7-day renewal window.
- Tutor subscription page reconciles Flutterwave redirects automatically.
- Period-end cancellation is supported without immediately removing paid access.
- Production custom domains are accepted as payment return URLs.

## Validation performed
- `functions/npm run build`: passed.
- Phase 1/2 + Phase 3 subscription regression tests: 8 passed, 0 failed.
- Full source regression suite reached 195/196; the only failure in the extracted archive was the pre-existing repository security test requiring a root `.gitignore`, which was not included in the uploaded ZIP.

## Local validation required
npm run typecheck
npm test
npm run release:check
cd functions
npm run build
cd ..

## Deployment
firebase deploy --only functions:createCommerceCheckout,functions:flutterwaveCommerceWebhook,functions:reconcileCommercePayment,functions:refreshTutorSubscriptionLifecycle,functions:cancelTutorSubscriptionAtPeriodEnd,hosting
