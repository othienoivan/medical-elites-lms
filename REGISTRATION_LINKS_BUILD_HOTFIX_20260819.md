# Registration Links Build Hotfix — 2026-08-19

Fixes two compile blockers in the Class Cohorts registration-links batch:

1. `functions/src/index.ts`: removes out-of-scope `currentInstitutionId` / `linkInstitutionId` references from `ensureMyTenantWorkspace`. New workspace memberships created by that function are marked as the default membership for the workspace it is actively ensuring.
2. `src/pages/RegistrationLinksPage.tsx`: removes the unused `requiresClassPlacement` constant after the Manual Exception validation refactor.

No registration-link behavior or cohort design was removed by this hotfix.
