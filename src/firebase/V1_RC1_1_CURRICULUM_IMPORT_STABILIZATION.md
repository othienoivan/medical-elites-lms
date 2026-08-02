# Medical Elites V1 RC1.1 — Curriculum Import Stabilization

## Included
- Unified administrator/tutor import actor metadata.
- Tutor-safe Firestore writes in small batches to avoid multi-write rules limits.
- Dry-run validation before import.
- AI/fallback method, provider and analysis-time indicator.
- Readiness score, duplicate count, missing-field and hour-consistency checks.
- Curriculum mapping preview by year and semester.
- Detailed Firebase error messages.
- Import audit fields: UID, email, name and role.
- Downloadable JSON import report.

## Required deployment
```powershell
npm run lint
npm run typecheck
npm run build
firebase deploy --only firestore:rules
```

## Rollback
Restore the previous `src/components/curriculum/CurriculumImportPanel.tsx`,
`src/firebase/curriculumImport.ts`, `src/models/CurriculumImport.ts`, and
`firestore.rules`, then rebuild and redeploy Firestore rules.
