# Medical Elites LMS v1.2.3 Content Statistics Type Hotfix

## Corrected issue

`CourseUnitDetailsPage.tsx` reads `contentStats.lessonCounts[module.id]`, but the revised `useCourseUnitContentStats` hook omitted `lessonCounts` from its public return value.

## Changes

- Restored the typed `lessonCounts: Record<string, number>` property.
- Calculates unique published lesson totals for each module.
- Preserves aggregate course-unit module and lesson totals.
- Clears counts and errors consistently when no authenticated user or course unit is available.
- Applied the same hook implementation to the mirrored source tree.

## Build

Run from the project root:

```powershell
npm run build
```

Then deploy the frontend and Firestore rules:

```powershell
firebase deploy --only firestore:rules,hosting
```
