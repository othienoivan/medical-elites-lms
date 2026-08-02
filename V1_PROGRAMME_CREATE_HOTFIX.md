# V1 Programme Creation Permission Hotfix

## Cause
Programme creation failed for tutor profiles without an institution assignment because the client omitted `institutionId`, while Firestore rules required direct equality with a null profile institution. In Firestore rules, a missing property is not equivalent to an explicitly stored null value.

## Fixes
- Programme creation now normalizes ownership fields in the repository.
- `institutionId` is persisted as `null` for independent tutors.
- Missing ownership and assignment arrays are populated from the authenticated creator.
- Firestore creation rules now safely accept either a matching institution ID or no institution for independent tutors.
- The create-programme page now shows the underlying Firebase error for faster diagnosis.

## Deployment
Deploy the application and Firestore rules:

```bash
firebase deploy --only firestore:rules
```
