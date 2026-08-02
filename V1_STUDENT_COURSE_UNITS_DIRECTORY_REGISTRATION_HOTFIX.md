# V1 Student Course Units and Registration Directory Hotfix

## Corrected

- Student Course Units now route to `/student/course-units` and render `MyCoursesPage`.
- `/tutor/course-units` now renders the tutor curriculum/course-unit catalogue; creation remains at `/tutor/course-units/new`.
- Accepting a registration link now creates a canonical `students/{authUid}` School Management record.
- Existing successful link claims with no student record are repaired when the student clicks Accept and join again.
- The created student record includes tutor ownership, programme, year, semester, institution, assigned course units and authentication identity.
- Firestore rules permit only the authenticated student to create/update their canonical record when backed by their exact registration-link enrollment transaction.

## Deploy

```bash
npm install
npm run build
firebase deploy --only hosting,firestore:rules
```
