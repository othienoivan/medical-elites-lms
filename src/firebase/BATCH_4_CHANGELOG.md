# Batch 4 — Authoritative Student Records

## Implemented

- Added optional `authUid` to the student model to link a Firestore student record to Firebase Authentication and quiz attempts.
- Added optional `studentAuthUid` to academic enrolments.
- Centralized student CRUD operations in `src/firebase/students.tsx`.
- Added duplicate protection for registration number, student number, and Auth UID.
- Refactored `useStudents` to consume the Firebase service and expose loading/error/refresh state.
- Updated student registration to accept an optional existing Firebase Auth UID and rely on server timestamps.
- Updated student profile and transcript attempt matching to use `authUid` when available.
- Corrected Firestore rules so students read their own student record through `authUid`, while tutors/admins retain management access.
- Corrected enrolment self-access to support `studentAuthUid` and legacy `userId`.

## Important operational note

Registering a student record does not create a Firebase Authentication account. For a student who already has a login, paste that user's Firebase Authentication UID into the optional Auth UID field. Secure tutor-created login provisioning should later be implemented with a trusted backend or Firebase Admin SDK, not from the browser client.

## Verification

- `npm run build`: PASS
- Remaining lint findings are pre-existing hook-effect findings and one TakeQuiz dependency warning.
