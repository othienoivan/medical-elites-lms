# Project Hippocrates Phase 4 — Wallets, Revenue Sharing and Payout Controls

## Added

- Trusted wallet provisioning through `createFinanceWallet`.
- Idempotent revenue distribution through `distributeFinanceRevenue`.
- Default 50/50 tutor/platform revenue split with commission-rule overrides.
- Immutable journals and ledger entries for financial activity.
- Tutor withdrawal requests with atomic reservation of available funds.
- Platform finance approval and rejection workflow.
- Final payout completion through `completeFinanceWithdrawal`.
- External payout reference capture.
- Atomic release of frozen funds when a payout is marked paid.
- Immutable audit record for completed payouts.

## Security

- Browser clients cannot create or change wallets, journals, ledger entries, commission rules or withdrawals.
- Tutors can read only their own wallets, ledger entries and withdrawals.
- Platform finance privileges are required to distribute revenue, review withdrawals and complete payouts.
- Idempotency keys prevent duplicate financial command processing.

## Deployment

```powershell
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions:createFinanceWallet,functions:distributeFinanceRevenue,functions:requestFinanceWithdrawal,functions:reviewFinanceWithdrawal,functions:completeFinanceWithdrawal,functions:upsertFinanceCommissionRule,firestore:rules,firestore:indexes,hosting
```
