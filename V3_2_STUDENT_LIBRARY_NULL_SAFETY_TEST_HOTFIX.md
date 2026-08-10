# v3.2 Student Library Null-Safety and Regression Test Hotfix

## Corrected

- Preserves the authenticated user in a non-null local variable before asynchronous library loading.
- Resolves TypeScript `TS18047: currentUser is possibly null`.
- Updates the roadmap regression test to accept the null-safe local variable instead of requiring one exact variable name.
- Retains buyer-scoped purchase loading, active-purchase filtering, search, resource-type filtering, and owned-product navigation.

## Files

- `src/pages/marketplace/StudentLearningLibraryPage.tsx`
- `tests/v311-to-v32-roadmap-completion.test.mjs`
