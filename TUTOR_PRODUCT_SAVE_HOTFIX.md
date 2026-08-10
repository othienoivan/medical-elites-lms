# Tutor Product Save Hotfix

## Root cause
The product builder sends optional fields such as `tenantId`, `institutionId`, `programmeId`, `semester`, `yearOfStudy`, and `accessDays`. When any of these values are `undefined`, Firestore rejects the write because undefined values are not supported by default.

## Fix
The marketplace repository now removes undefined values recursively before create and update operations. Valid values, arrays, nested price objects, timestamps, and null values are preserved.

## Deployment
Run:

```powershell
npm run typecheck
npm run release:check
firebase deploy --only hosting
```
