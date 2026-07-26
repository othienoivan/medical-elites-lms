# V1 Access-Control Refactor — Programmes, Students and Academic Records

## Purpose
This batch fixes two verified release blockers:

1. Tutor-created student registration failed with `Missing or insufficient permissions`.
2. Tutor B could see Tutor A's programmes.

## Implemented

### Central access scope
- Added `src/firebase/accessScope.ts`.
- Added `src/hooks/useAccessScope.ts`.
- All refactored repositories receive the authenticated UID, role, institution, assigned programmes and assigned course units.

### Tutor and institution isolation
Refactored Firestore access for:
- Programmes
- Course units (`courses`)
- Modules
- Questions
- Students

Tutors now query only:
- Records they own.
- Records explicitly assigned to them.
- Legacy child records belonging to programmes they own or are assigned.

Institution administrators query only records with their `institutionId`.
Students query only assigned programmes and course units.

### Ownership metadata on new records
New programmes, course units, modules, questions and students now include:
- `ownerUserId`
- `createdByUid`
- `institutionId`
- `assignedTutorIds`

Student records additionally include:
- `registeredByRole`
- `onboardingSource`
- `assignedCourseUnitIds`

### Student registration permission fix
Tutor/admin student creation now writes all metadata required by Firestore rules.
Duplicate checks are constrained to the tutor's own workspace or the administrator's institution so the checks themselves do not trigger permission errors.

### Legacy compatibility
- Programmes created before this refactor remain visible to their original tutor through the legacy `createdBy` UID.
- Legacy course units, modules and questions remain visible through their accessible parent programme.
- No cross-tutor fallback based on email or untrusted display fields was added.

### Firestore security rules
The academic catalogue rules now enforce:
- Owner access.
- Explicit tutor assignment.
- Same-institution administrator access.
- Student programme/course-unit assignment.
- Ownership metadata on creates.
- Owner/assignment checks on updates and deletion.

## Validation
- `npm run lint` — passed.
- `npm run build` — passed.
- Vite production bundle generated successfully.

## Required deployment
Deploy the included rules after deploying the application:

```bash
firebase deploy --only firestore:rules
```

## Retest
1. Sign in as Tutor A and create a new programme.
2. Sign in as Tutor B and confirm Tutor A's programme is absent.
3. Sign in as Tutor A and register a student.
4. Confirm the student is created and appears only in Tutor A's directory.
5. Confirm Tutor B cannot open the programme or student by direct URL.
