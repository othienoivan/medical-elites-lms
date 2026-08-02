# Medical Elites v3.0.0 RC4 Batch 3

Adds Flutterwave commerce checkout, verified webhooks, invoices, receipts, subscription/license activation, reconciliation and refunds.

## Deployment

```powershell
npm install
npm run release:check
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions,firestore:rules,firestore:indexes,hosting
```

Set the Flutterwave webhook URL to the deployed `flutterwaveCommerceWebhook` endpoint.
