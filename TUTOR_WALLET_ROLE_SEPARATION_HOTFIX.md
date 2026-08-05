# Tutor Wallet and Administrator Finance Separation Hotfix

## Corrected behavior

- `/tutor/finance` is now a tutor-only wallet workspace.
- Tutors can create/open their private UGX wallet, view balances and payout history, and request payouts.
- `/admin/finance` is now the institution billing workspace for administrators.
- Administrators no longer share the tutor wallet page.
- The Admin Dashboard finance shortcut now opens `/admin/finance`.
- Wallet creation remains server-controlled through `createFinanceWallet` and idempotent per tutor/currency.
