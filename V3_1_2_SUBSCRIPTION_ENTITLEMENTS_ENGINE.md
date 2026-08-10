# Medical Elites LMS v3.1.2 — Subscription & Entitlements Engine Phase 1

## Objective
Tutor registration no longer requires a paid-plan decision. Public tutor accounts start with a Free Tutor entitlement snapshot and can upgrade later.

## Architecture
- Account activity (`users/{uid}.isActive`) remains an identity/security property.
- Subscription status is resolved independently from `subscriptions`.
- Independent tutors fall back to `tutor_free` when no canonical plan is available.
- Expired/cancelled/suspended subscription state no longer disables the tutor account; it falls back to Free Tutor entitlements.
- Paid-plan assignment remains server controlled.

## Free Tutor compatibility plan
Starter limits are centralized in `src/models/defaultPlans.ts`. These are client-side compatibility defaults; authoritative paid plan/subscription records remain in Firestore/server functions.

## Tutor onboarding
Public tutor registration:
1. Creates the active tutor profile.
2. Calls existing `bootstrapTenantWorkspace` best-effort.
3. Opens `/tutor?welcome=1`.
4. TenantProvider resolves canonical workspace/plan, or Free Tutor compatibility access.

## Tutor subscription centre
`/tutor/subscription` shows the effective plan, limits and optional upgrade path.

## Future Phase 2
- Trusted subscription checkout and renewal.
- Billing history and invoices.
- Grace periods and renewal notifications.
- Server-side usage counters/limit enforcement.
- Automated plan migrations.
