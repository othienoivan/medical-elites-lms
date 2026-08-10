# v3.1.4 Tutor Operations Restoration

Restores and hardens the tutor operational workspaces:

- Submission Inbox now loads canonical and legacy tutor submissions through a trusted callable.
- Gradebook uses the same trusted assessment workspace source and retains filters/export.
- Class Analytics uses the trusted data source and tutor-defined pass/fail state.
- Manual marking/releasing is handled by a trusted callable that verifies tutor ownership.
- Marketplace Analytics now derives verified sales and gross revenue from marketplace purchase records, rather than stale cached snapshots/product counters.
- Marketplace analytics reports unique product viewers, verified sales, customers, refunds and per-product revenue.
- Tutor Wallet now includes ledger-backed recent earnings activity, current balances, payout history and payout request controls.
- Existing finance revenue-sharing wallet credits remain the source of truth.

Regression suite: 222 passed, 0 failed in the patch environment.

Recommended validation locally:

npm install
npm run typecheck
npm test
npm run release:check
cd functions
npm install
npm run build
cd ..

Deploy after all checks pass:

firebase deploy --only functions,firestore:rules,firestore:indexes,hosting
