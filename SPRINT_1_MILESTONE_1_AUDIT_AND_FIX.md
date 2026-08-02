# Medical Elites LMS — Sprint 1 Milestone 1

## Scope

This release addresses the first two failures confirmed in production testing:

1. Student profile edits did not persist to the student academic record.
2. Course-unit cards continued to show zero modules and zero lessons.

## Root causes found

### Student profile

The profile page only updated `users/{uid}`. The student-facing academic record is commonly stored in `students/{studentId}` and is linked by `authUid` or email. The page also read programme, registration number, year and semester only from the user profile, even when those values existed only in the student document.

Firestore rules did not permit a student to update safe personal fields in their own `students` document.

### Course-unit content totals

The previous statistics hook called `getModules(scope)`. For students, that function immediately returned an empty array whenever `users/{uid}.assignedCourseUnitIds` was empty. This ignored course units made visible through programme enrolment or other active enrolment records.

The revised hook queries modules by the course-unit ID shown on the card and counts published lessons linked either directly to the course unit or through its modules. It no longer depends on the stale `assignedCourseUnitIds` array merely to calculate totals.

## Changes

- Rebuilt `MyProfilePage.tsx` to load the canonical student record using Auth UID and email fallback.
- Profile save now writes safe personal fields to both `users/{uid}` and the linked `students/{studentId}` in one Firestore batch.
- Academic identity fields are displayed from the student record where available.
- Firestore rules now allow a student to update only their own safe profile fields: `fullName`, `phone`, `emergencyContact`, and identity-link maintenance fields.
- Rebuilt `useCourseUnitContentStats.tsx` to query actual module and published lesson records by course unit.
- Course cards now show `Content totals unavailable` when Firestore rejects the count query instead of silently presenting a false zero.
- Synchronized deployable and mirrored Firestore rules.

## Verification status

- Existing structural test suite: 28 applicable tests; mirrored-rules check repaired.
- One existing donation test cannot run because the uploaded archive does not contain `functions/src/index.ts`.
- Full TypeScript/Vite compilation could not be completed in the audit environment because the uploaded archive excluded `node_modules`, and the internal package mirror could not supply `zod-validation-error@4.0.2` during `npm ci`.

Run the normal local build before deployment:

```powershell
npm install
npm run build
firebase deploy --only firestore:rules,hosting
```

## Production checks

1. Sign in as a student with a linked `students` document.
2. Change name, telephone and emergency contact; save; refresh the page.
3. Confirm both `users/{uid}` and the linked student document reflect the change.
4. Open My Course Units and confirm cards show totals from actual module and published lesson documents.
5. If a card says `Content totals unavailable`, inspect the browser console for the exact Firestore permission or index error rather than treating it as zero content.
