# v3.0.0 RC2 Emergency Compatibility Hotfix

This release restores legacy institution-scoped LMS reads while retaining the non-destructive tenant foundation.

## Fixes
- Legacy academic queries continue using the original `institutionId` even when a tenant workspace is active.
- Messaging contacts are queried by institution instead of attempting an unauthorized platform-wide users query.
- Existing conversations load independently of contact-directory failures.
- Platform-wide metrics are requested only by `super_admin` accounts.
- Same-institution users may be read for the internal messaging directory.
- The service worker no longer rejects navigation requests when both the network and cache miss.

## Deployment
Deploy Firestore rules and Hosting together.
