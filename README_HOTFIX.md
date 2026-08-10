# Medical Elites v3.1.2 — Workspace Permission + Service Worker Final Hotfix

## Root cause found in the supplied project ZIP

The paid subscription records and Flutterwave fulfillment were correct. The browser fell back to **Free Tutor** because `resolveTenantWorkspace()` failed with Firestore `Missing or insufficient permissions`.

The supplied Firestore rules had a circular authorization dependency:

1. Browser reads `tenants/{tenantId}`.
2. The tenant rule calls `hasTenantMembership(tenantId)`.
3. `hasTenantMembership()` attempts to read `tenants/{tenantId}` again to check tenant status.
4. Firestore denies the circular authorization path.
5. `TenantProvider` catches the error and activates its legacy fallback, which resolves to Free Tutor.

The service worker also intercepted and attempted to cache cross-origin Firebase/API GET responses. That produced `Cache.put() encountered a network error` and could complicate debugging/state freshness.

## Changes

- Adds `hasActiveTenantMembership()` as a membership-only helper.
- `tenants/{tenantId}` reads use the membership-only helper, breaking the circular rule dependency.
- Downstream tenant-scoped resources continue to use the full `hasTenantMembership()` check, which still requires tenant status `trial` or `active`.
- Keeps subscription access tenant-scoped; it is **not** opened broadly to signed-in users.
- Normalizes paid plans so either `isActive: true` or `status: "active"` is accepted.
- Keeps the active subscription as the authoritative source of `planId`.
- Removes a duplicate `setActiveSubscription()` call.
- Service worker now intercepts/caches only same-origin shell/static assets and never Firebase, Flutterwave, or other cross-origin API traffic.
- Changes the service-worker cache version so stale cached assets are purged on activation.
- Adds regression tests for the circular rule defect, paid-plan normalization, and service-worker scope.

## Validation performed

`npm test` on the supplied ZIP after patching:

- 199 tests
- 199 passed
- 0 failed

Run local typecheck/build/release checks before deployment because the uploaded root project did not include root `node_modules`.

## Deployment

After applying the batch from the project root:

```powershell
npm run typecheck
npm test
npm run release:check
firebase deploy --only firestore:rules,hosting
```

After deployment, close all open Medical Elites tabs and reopen the site. If the old service worker remains active, use DevTools > Application > Service Workers > Unregister once, then reload. The new worker will register and will no longer intercept Firebase requests.

No new subscription payment is required. The existing annual paid subscription remains the authoritative record.
