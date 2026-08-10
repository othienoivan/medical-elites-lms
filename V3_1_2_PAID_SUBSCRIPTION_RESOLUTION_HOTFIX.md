# Medical Elites v3.1.2 — Paid Subscription Resolution Hotfix

## Problem
A tutor could complete a verified annual Flutterwave subscription and the backend correctly wrote the paid plan to `subscriptions/{tenantId}`, `licenseGrants/{tenantId}`, and `tenants/{tenantId}`, while the browser still displayed **Free Tutor**. The browser also logged `Missing or insufficient permissions` while resolving the active tenant workspace.

## Root causes fixed
1. The `/tenants/{tenantId}` read rule authorized via `hasTenantMembership(tenantId)`, while that helper itself read `/tenants/{tenantId}` to validate tenant status. This created a circular authorization dependency for tenant reads.
2. Older active `plans` records that used `status: "active"` without an explicit `isActive: true` could be treated as inactive by the client and silently replaced by the Free Tutor compatibility plan.
3. `TenantProvider` set the same resolved subscription twice; this was cleaned up while preserving the authoritative subscription state.

## Changes
- Added `hasActiveTenantMembership()` for tenant-document reads and kept `hasTenantMembership()` for cross-document authorization that also validates tenant status.
- `/tenants/{tenantId}` now uses the membership-only helper.
- `getPlan()` normalizes plan activity from either `isActive === true` or `status === "active"`.
- Canonical `subscriptions/{tenantId}` resolution remains the first subscription read.
- Added regression tests covering the permission architecture and paid-plan resolution.

## Deployment
This batch changes both Hosting source and Firestore rules.

```powershell
npm run typecheck
npm test
npm run release:check
firebase deploy --only firestore:rules,hosting
```

No new payment is required. Existing verified subscriptions remain authoritative.
