# v3.1 Payment Completion Engine Hotfix

This patch adds redirect-driven Flutterwave reconciliation as a reliable complement to webhooks.

## Changes
- `reconcileCommercePayment` accepts Flutterwave redirect parameters and can verify by transaction ID or `tx_ref`.
- Paid orders are fulfilled idempotently; repeat redirect/webhook processing is safe.
- Verification failures are recorded on the order and payment intent.
- Student purchases page automatically verifies payments after Flutterwave redirects back.
- The page displays verifying, success, and retry states and refreshes the order list after fulfillment.

## Deploy
```powershell
npm run typecheck
cd functions
npm run build
cd ..
npm test
firebase deploy --only functions:reconcileCommercePayment,hosting
```
