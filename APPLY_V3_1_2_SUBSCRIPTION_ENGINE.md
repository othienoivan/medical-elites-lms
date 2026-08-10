# Apply Medical Elites LMS v3.1.2 Subscription & Entitlements Engine

## What this batch changes
- Public tutors start on Free Tutor access automatically.
- Tutor registration no longer requires a paid-plan decision.
- Tutor account activity remains separate from subscription state.
- Expired/cancelled/suspended paid subscriptions fall back to Free Tutor entitlements instead of disabling the account.
- TenantProvider resolves subscription state separately from plan state.
- Added `/tutor/subscription` with plan limits and optional upgrade messaging.
- Added reusable entitlement decision helpers.

## Validate locally
```powershell
npm install
npm run typecheck
npm test
npm run release:check
```

## Deploy
This batch is frontend/domain-only and uses the existing `bootstrapTenantWorkspace` callable and existing subscription collection/rules.

```powershell
firebase deploy --only hosting
```

If your local branch also contains pending Firestore rule or Function changes, deploy those separately after their own validation.

## Important
The uploaded baseline archive did not include the root `functions/` source directory. The focused regression tests for this batch pass, but the complete test suite in the sandbox cannot execute tests that read `functions/src/index.ts`. Your local project should still run the full suite before deployment.
