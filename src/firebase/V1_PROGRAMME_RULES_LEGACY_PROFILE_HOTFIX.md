# V1 Programme Rules Legacy Profile Hotfix

## Root cause
Firestore security rules accessed `users/{uid}.institutionId` directly. Legacy or independent tutor profiles may not contain that field. In Firestore Rules, reading a missing map field can cause the expression to fail rather than returning `null`, so valid programme create requests were rejected with `Missing or insufficient permissions`.

## Fix
- `currentInstitutionId()` now checks whether the profile contains `institutionId` before reading it.
- Added `recordInstitutionId(data)` for safe record-field access.
- `sameInstitution()` and `validCreateInstitution()` now use safe accessors.
- Independent tutors can create programmes with `institutionId: null`.
- Institution-linked tutors/admins must create records under their own institution.

## Deployment
Deploy these rules after deploying the application:

```bash
firebase deploy --only firestore:rules
```

Then sign out and sign in before retesting.
