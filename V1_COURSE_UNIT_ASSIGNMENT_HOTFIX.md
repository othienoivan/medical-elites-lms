# V1 Course Unit Assignment Hotfix

## Fixed
- Tutor course-unit queries now use independent fallbacks instead of failing the entire loader when one legacy ownership query is denied.
- Added legacy ownership queries for `createdByUid` and `createdBy`.
- Student registration and edit screens load all tutor-accessible course units, including unpublished units, for assignment.
- Academic placement matching now recognises numeric and Roman semester values such as `Semester 1` and `Semester I`.
- Firestore course/module/lesson reads safely check optional `programmeId` and `courseUnitId` fields.
- Removed duplicate `/tutor/lessons` React navigation key by routing Learning Packages to `/tutor/learning-packages`.

## Deployment
```bash
firebase deploy --only hosting,firestore:rules
```
