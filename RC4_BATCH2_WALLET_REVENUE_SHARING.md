# Medical Elites Platform v3.0.0 RC4 Batch 2

Introduces server-controlled wallets, immutable journals and ledger entries, configurable commission precedence, revenue distribution, idempotent finance commands, accounting periods, withdrawal workflow foundation, Revenue Sharing UI and Finance Operations Centre.

## Deployment
1. `npm run release:check`
2. `cd functions && npm install && npm run build && cd ..`
3. `firebase deploy --only functions,firestore:rules,firestore:indexes,hosting`

## Rollback
Redeploy the previous Hosting build and previous Firestore rules. Do not delete journals, ledger entries, finance command records, or wallets created by this release.
