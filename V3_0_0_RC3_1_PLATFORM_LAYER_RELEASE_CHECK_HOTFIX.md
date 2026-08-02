# Medical Elites Platform v3.0.0 RC3.1
## Platform Layer Release-Check Hotfix

This release corrects the RC3 build/test package so it can be overlaid safely on the stable LMS project.

### Corrections
- Added `validate:domain` to `package.json`.
- Added `scripts/validate-domain-boundaries.mjs`.
- Updated `release:check` to validate domain boundaries before release validation and tests.
- Removed the Firebase `Timestamp` dependency from the platform domain model. Infrastructure remains responsible for Firebase types.
- Replaced stale RC2 multi-tenant tests with tests for the adopted additive Platform Layer architecture.
- Preserved the stable AuthProvider-based LMS runtime; no TenantProvider is introduced into academic workflows.
- Verified Platform Console protection through `PlatformAccessGate`.
- Verified additive platform Firestore collections and existing academic collection rules.

### Validation
- Domain boundary validation: passed.
- Automated regression tests: 67 passed, 0 failed.

### Deployment
Run `npm run release:check`, then deploy Firestore rules, indexes, and Hosting.
