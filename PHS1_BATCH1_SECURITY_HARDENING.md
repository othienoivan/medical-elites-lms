# PHS-1 Batch 1 — Security Hardening

Version: `3.0.0-phs.1.1`

## Deployment preflight

Before deploying Firestore rules, add `platformRole: "super_admin"` to the founder's `users/{uid}` document. The previous rules implicitly treated administrators without this field as platform administrators; that unsafe fallback has been removed.

## Validation

```powershell
npm install
npm run release:check
cd functions
npm install
npm run build
cd ..
```

## Deployment

```powershell
firebase deploy --only firestore:rules,firestore:indexes,storage,functions,hosting
```

## Post-deployment checks

1. Founder can open `/platform`.
2. Ordinary institution administrator is denied `/platform`.
3. Tutor and student academic workflows remain visible.
4. Student cannot invoke tutor-only AI modes.
5. AI requests show rate-limit errors after the configured threshold.
6. Donation checkout and verified webhook completion still work.
7. Image, PDF, Word, PowerPoint, audio, and video uploads still work in their intended paths.

## Rollback

Keep the previous deployed archive and rules fingerprint. To roll back, restore the previous `firestore.rules`, `storage.rules`, `functions/src/index.ts`, and `firebase.json`, rebuild, then redeploy the same targets.
