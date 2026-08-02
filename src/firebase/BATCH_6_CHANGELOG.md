# Batch 6 - Enrolment-Controlled Student Learning Access

## Added
- `src/hooks/useStudentLearningAccess.tsx`
  - Loads active SIS enrolments by `studentAuthUid`.
  - Preserves compatibility with legacy enrolments using `userId`.
  - Derives authorised programme and course-unit IDs.
  - Provides course-unit and assessment access checks.
- `src/pages/MyCoursesPage.tsx`
  - Displays only course units assigned through active enrolments.
  - Shows clear empty and enrolment-error states.

## Updated
- `src/pages/DashboardPage.tsx`
  - Replaced global course browsing with assigned course units.
  - Filters dashboard assessments through the learner's enrolment.
  - Uses real programme/course-unit assignments for learning cards.
- `src/pages/StudentAssessmentPage.tsx`
  - Shows only assessments linked to the student's programme or assigned course units.
  - Retains legacy unlinked assessments only for legacy self-enrolled learners.
- `src/pages/CourseUnitDetailsPage.tsx`
  - Removed student self-enrolment from the learning workflow.
  - Locks modules when the course unit is not assigned.
  - Tutors and administrators retain elevated access.
- `src/routes/AppRouter.tsx`
  - Added protected `/my-courses` route.

## Verification
- `npm run build`: PASS
- `npm run lint`: Existing hook-effect errors remain in older hooks; no new build errors were introduced.

## Important operational requirement
Institution-managed student enrolments must include `studentAuthUid`, `programmeId`, and `courseUnitIds`. Assessments should be linked to `programmeId` and/or `courseUnitId` to appear for the correct learners.
