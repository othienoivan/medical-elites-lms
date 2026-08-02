# Project Florence — Module Progress Button State Hotfix

## Summary

Student module action labels now derive from persisted enrolment progress:

- **Start Module** — no saved start or completion state.
- **Continue Learning** — module is present in `startedModules` but not `completedModules`.
- **Review Module** — module is present in `completedModules` or its required quiz has been passed.

## Compatibility

The progress loader now resolves enrolments through:

- `userId`
- `studentAuthUid`
- `studentId`
- canonical `{uid}_{courseUnitId}` enrolment document IDs
- `courseId`, `courseUnitId`, `courseUnitIds`, and `assignedCourseUnitIds` mappings

## Completion progress

The secure `completeModuleLearning` Cloud Function now recalculates and persists overall course progress based on the number of published modules.

## Security

Module completion remains server-validated. Students cannot directly add `completedModules` through Firestore client rules.
