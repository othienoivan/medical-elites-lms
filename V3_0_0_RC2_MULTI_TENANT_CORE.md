# Medical Elites Platform v3.0.0 RC2 — Multi-Tenant Core

## Implemented
- First-class tenant, tenant membership, plan and subscription types.
- Active tenant context with local workspace persistence.
- Existing access-scope hooks now resolve the active tenant while preserving legacy institution IDs.
- Workspace switcher in authenticated headers.
- Central entitlement, quota and commission helpers.
- Protected platform console foundation for super administrators.
- Firestore rules for tenants, memberships, plans, subscriptions, feature flags and usage ledgers.
- Dry-run legacy migration plan using `tenantId = institutionId`.

## Compatibility
Existing LMS records continue to use `institutionId`. New code resolves the preferred workspace from `tenantId`, then falls back to `institutionId`. No destructive migration is performed in RC2.

## Required rollout
1. Create a platform tenant and plans.
2. Create tenant membership documents for current administrators and tutors.
3. Add `tenantId` to users and new records.
4. Backfill legacy collections in a reviewed migration.
5. Promote the founder account to `super_admin` only through a trusted Admin SDK process.

## Security note
Do not let browser clients grant themselves `super_admin`, tenant owner roles, plans, credits or wallet balances. Those writes must remain server-controlled.
