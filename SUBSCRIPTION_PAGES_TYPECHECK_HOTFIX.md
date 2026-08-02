# Subscription Pages Typecheck Hotfix

Fixes incompatible loader types in:

- `src/pages/platform/PlatformPlansPage.tsx`
- `src/pages/platform/PlatformLicensesPage.tsx`

The pages now load their canonical Phase 3 models directly from the shared platform repository:

- `Plan` from `plans`
- `TenantSubscription` from `subscriptions`

This avoids passing legacy `PlatformPlan` and `LicenseGrant` loaders into hooks typed for the new subscription models.
