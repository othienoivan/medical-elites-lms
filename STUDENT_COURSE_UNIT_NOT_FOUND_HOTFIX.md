# Student Course Unit Not Found Hotfix

## Fixed

- Course-unit detail routes now resolve canonical Firestore document IDs, legacy `courseId` values, legacy `id` fields, and slugs.
- The details page no longer declares a course unit missing before direct route resolution completes.
- Firestore rules now recognize deterministic legacy enrollment documents such as `{studentUid}_{courseId}` when authorizing student course reads.
- A malformed duplicate `assignedTutorIds` query clause in the course-unit service was removed.

## Verification

1. Sign in as a student with an active enrollment.
2. Open **Student → Course Units**.
3. Select **View Course Unit**.
4. Repeat from the dashboard **Continue Learning** section.
5. Refresh the course-unit details URL directly.
6. Confirm the course title, modules and lessons load instead of the Course Unit Not Found screen.
