# Project Florence — Release Gate and Regression Baseline Hotfix

## Scope
This release gate hotfix restores the repository-safe environment templates required by the platform baseline validator and records the current regression status.

## Changes
- Added `.env.example` with the complete Vite/Firebase variable contract and blank values.
- Added `.env.staging.example` for staging deployments.
- Added `.firebaserc.example` with safe placeholder project aliases.
- Updated `.gitignore` so the three template files remain version-controlled while populated environment files remain ignored.
- Preserved the default-deny Firestore and Storage security baselines.

## Automated verification completed
- Platform baseline validation: PASS
- Domain boundary validation: PASS
- Release validation: PASS
- Performance budget validation: PASS
- Automated regression tests: 137 passed, 0 failed

## Environment limitation
The final TypeScript/build phases could not run in the artifact environment because the supplied dependency directory did not contain `vite/client` and `@types/node`. A dependency repair was attempted, but the internal package mirror did not contain `zod-validation-error@4.0.2`.

Run the complete release gate on the development computer:

```powershell
npm install
npm run release:check
```

## Deployment
After the complete release check succeeds:

```powershell
firebase use medical-elites-lms
firebase deploy --only firestore:rules,firestore:indexes,storage,functions,hosting
```

## Production smoke tests
1. Student opens an assigned course unit from Course Units and Continue Learning.
2. Module buttons display Start Module, Continue Learning, or Review Module from saved progress.
3. Quiz attempt counters and maximum-attempt blocking work after refresh and in another browser.
4. PDF, PPT, and PPTX resources show Download only.
5. Tutor uploads an allowed resource; student upload is denied.
6. Submission Inbox paginates with Load More.
7. Login, profile editing, lesson viewing, quiz submission, and logout complete without permission errors.
