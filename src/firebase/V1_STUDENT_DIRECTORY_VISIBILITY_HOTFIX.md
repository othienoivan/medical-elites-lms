# V1 Student Directory Visibility Hotfix

## Root cause
New tutor-created student records do not have an `authUid` until the learner creates or links an account. The Firestore read rule accessed `resource.data.authUid` directly. In Firestore rules, accessing a missing map field can fail the entire rule evaluation, so the tutor's ownership checks were never reached.

## Fixes
- Guarded optional `authUid`, email and identity fields with `keys().hasAny(...)`.
- Made UID/email ownership helper functions safe for incomplete and legacy records.
- Made tutor student loading resilient with independent ownership queries.
- Added legacy `createdByUid` and `createdBy` lookup support.
- A failed legacy query no longer clears valid student results.

## Deployment
Deploy hosting and rules:

```bash
firebase deploy --only hosting,firestore:rules
```
