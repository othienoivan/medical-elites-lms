# V1.1 Admin Course Unit Delete Typecheck Hotfix

## Fix
`AdminCourseUnitsPage.tsx` now passes the active `AccessScope` to `deleteCourseUnit`, matching the hardened two-argument service signature.

Before:
```ts
await deleteCourseUnit(item.id);
```

After:
```ts
await deleteCourseUnit(item.id, accessScope!);
```

A regression test was added to prevent the one-argument call from returning.

## Correct deployment order
```powershell
npm install
npm run release:check
firebase use medical-elites-lms
firebase deploy --only firestore:rules,firestore:indexes,hosting
```
