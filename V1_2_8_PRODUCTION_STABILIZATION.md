# Medical Elites LMS v1.2.8 — Production Stabilization

## Scope
This release consolidates the deployed v1.2.7 source and restores missing backend and release-critical files that were absent from the previous package.

## Corrections
- Restored the complete Firebase Functions source tree, including `createDonationCheckout` and `medicalElitesAi`.
- Restored `functions/package.json` and `functions/tsconfig.json`.
- Restored `.env.example` required by the release validator.
- Added a single `npm run stabilize` quality-gate command.
- Updated the application version to `1.2.8`.
- Verified all 33 source-level regression tests pass.
- Verified Firestore rules and mirrored rules are synchronized.

## Required workstation validation
Run:

```powershell
npm install
npm run stabilize
```

Then validate Functions separately:

```powershell
cd functions
npm install
npm run build
cd ..
```

Deploy only after both builds succeed:

```powershell
firebase deploy --only firestore:rules,firestore:indexes,functions,hosting
```

## Manual regression checks
1. Student profile saves and persists after refresh.
2. Course-unit module and lesson counts are correct.
3. Programme/year/semester filtering works.
4. Tutor sees only assigned content and submissions.
5. Question Bank edit, delete, import and AI generation work.
6. Examination Builder saves, previews and archives exams.
7. Bulk student import previews, validates and allocates course units.
8. Donation checkout and AI assistant call deployed Functions successfully.
