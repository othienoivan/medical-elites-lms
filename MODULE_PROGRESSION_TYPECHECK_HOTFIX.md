# Module Progression TypeScript Hotfix

## Issue
`Promise.allSettled()` contains both `getDocs()` and `getDoc()` promises, so TypeScript infers each fulfilled value as a union of `QuerySnapshot`, `DocumentSnapshot`, and `null`.

## Fix
Before accessing `.docs`, the enrolment-query results are narrowed by checking that the fulfilled value is non-null and contains the `docs` property.

## Validation
Run:

```powershell
npm run typecheck
npm run release:check
```
