# RC4 Batch 3 — Flutterwave Commerce

## Scope

- Hosted checkout for subscription plans and future marketplace products.
- Transaction verification before fulfilment.
- Idempotent webhook receipts and manual reconciliation.
- Invoice, payment and receipt records.
- Subscription and license activation after verified payment.
- Marketplace entitlement foundation.
- Refund initiation through Flutterwave.

## Webhook

Configure Flutterwave to call the deployed `flutterwaveCommerceWebhook` function. The function validates the configured secret hash, re-verifies the transaction with Flutterwave, compares reference, status, currency and amount, and only then fulfils the order.

## Security

All commerce writes are server-controlled. Customers may read only their own orders, receipts, refunds and entitlements. Platform finance roles can inspect all records.

## Operational note

Use `/platform/finance/commerce` for manual reconciliation and refunds. Refund completion is asynchronous and should be reconciled from Flutterwave status/webhooks.
