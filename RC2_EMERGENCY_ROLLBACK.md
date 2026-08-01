# RC2 Emergency Rollback

This package restores the last stable pre-multi-tenant runtime while retaining production Storage rules and Firebase Functions.

## Why
The RC2 tenant runtime caused legacy academic and messaging queries to resolve against tenant-aware assumptions before production data had been migrated.

## Deploy

```powershell
npm install
npm run build
firebase deploy --only storage,firestore:rules,firestore:indexes,hosting
```

Do not deploy the RC2 tenant migration or tenant-aware rules again until cross-tenant emulator tests pass against production-shaped fixtures.
