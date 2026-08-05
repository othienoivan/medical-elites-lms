# Tutor Wallet Self-Creation Hotfix

Fixes `createFinanceWallet` so authenticated tutors may create only their own tutor wallet.
Platform Finance and Super Admin users retain authority to create platform, institution, or tutor wallets.

Security conditions:
- tutor role required for self-service;
- `ownerType` must be `tutor`;
- `ownerId` must equal the authenticated UID;
- all other wallet creation remains restricted to Platform Finance or Super Admin.
