# Medical Elites Platform v3.0 — Phase 1 Tenant Foundation

## Scope
This batch introduces the canonical workspace boundary for institutions and independent tutors while preserving every legacy `institutionId` workflow.

## Implemented
- Mounted `TenantProvider` beneath authentication so all protected workspaces resolve an active tenant.
- Added persisted active-workspace selection per authenticated user.
- Added tenant-aware `AccessScope` fields: `tenantId`, `tenantType`, and `tenantRoles`.
- Preserved `institutionId` as a compatibility alias for all existing academic services.
- Added an idempotent `bootstrapTenantWorkspace` callable Cloud Function.
- Institution tenants reuse the existing `institutionId`; independent tutor tenants use `tutor_{uid}`.
- Added deterministic memberships using `{tenantId}_{uid}`.
- Added server-controlled user fields: `tenantId`, `tenantIds`, and `activeTenantId`.
- Added tenant membership rules, tenant read isolation, subscription visibility, and membership query indexing.
- Added a non-destructive in-memory legacy fallback so an unavailable bootstrap cannot block the current LMS.

## Security
Browser clients cannot create or modify tenant memberships, tenant roles, tenant ownership, plans, or subscriptions. Tenant and membership creation occurs through trusted Admin SDK code or platform administration.

## Compatibility
No academic collection is renamed or moved. Existing `institutionId` records remain valid. New services can use `tenantId`, while old services continue receiving the appropriate legacy institution ID through `AccessScope`.

## Deployment
```powershell
npm install
npm run release:check
firebase deploy --only functions:bootstrapTenantWorkspace,firestore:rules,firestore:indexes,hosting
```

## Production verification
1. Sign in as an institution administrator and confirm the institution workspace resolves.
2. Sign in as an institution tutor and confirm the same tenant resolves with tutor membership.
3. Sign in as an independent tutor and confirm `tutor_{uid}` is created.
4. Confirm switching to a tenant without an active membership is rejected.
5. Confirm existing course units, modules, lessons, quizzes, and student access still work.
