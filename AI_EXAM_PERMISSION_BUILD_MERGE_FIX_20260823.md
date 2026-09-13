# AI Examination Permission + Build Merge Fix — 2026-08-23

This package preserves the trusted Cloud Function used to save AI-generated Professional Examination questions and merges the frontend TypeScript corrections from the prior examination/progression build hotfix.

Corrections included:
- Removed unused `index` callback parameter in ExaminationBuilderPage.
- Added `lessonId` and `lessonTitle` to the canonical `QuizAttempt` model.
- Moved the `useLessons(moduleId, true)` hook below the `moduleId` state declaration in QuizBuilderPage.
- Retains the server-side AI examination question persistence and tutor/course-unit authorization fix.
