# v3.1 Phase 1 — Flutterwave Payment Foundation

- Introduces provider-neutral payment contracts.
- Preserves the existing trusted Flutterwave checkout and reconciliation functions.
- Adds canonical `paymentIntents` records alongside legacy commerce orders and payments.
- Adds immutable, server-written `paymentWebhookEvents` operational records.
- Keeps MTN MoMo and Airtel Money disabled until dedicated provider adapters are configured.
- Browser clients cannot mutate payment status, webhook events, or reconciliation state.
