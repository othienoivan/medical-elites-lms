# Feature Batch Build Fix — 23 August 2026

Corrects TypeScript regressions found during deployment validation of the Professional Exams / Quiz / Cohort / Progression feature batch.

## Fixes
- ExaminationBuilderPage: removed unused `index` callback argument from generated question reference insertion.
- QuizAttempt model: added optional `lessonId` and `lessonTitle` fields so lesson-linked attempts are correctly typed in Manual Marking and Student Performance.
- QuizBuilderPage: moved `useLessons(moduleId, true)` after the `moduleId` state declaration to avoid use-before-declaration/type errors.

No intended feature behavior from the parent batch was removed.
