# Tenant Provider TypeScript Hotfix

## Problem

`resolveTenantWorkspace()` was inferred with a non-null `selected` membership because TypeScript treated `memberships[0]` as `TenantMembership`. The provider later assigns a legacy fallback where `selected` may correctly be `null`.

## Fix

Added an explicit `TenantWorkspaceResolution` return type declaring:

```ts
selected: TenantMembership | null;
```

This keeps the runtime behavior unchanged and corrects the compiler inference.
