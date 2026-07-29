# Medical Elites LMS V1.1 — Registration Link Auto-Enrolment Hotfix

## Issue
A student account created through a course-unit registration link was created successfully, but the selected course unit did not appear under Student > Course Units until the learner returned to the join page and manually clicked **Accept and join**.

## Fix
- Student signup through a registration link now automatically claims the link after profile creation.
- Approved claims redirect directly to `/student/course-units`.
- Claims requiring approval redirect to the dashboard with a pending message.
- Direct registration and tutor registration behavior remain unchanged.
- Source and mirrored source were updated.

## Validation
- 25/25 regression tests passed.
- Typecheck was not completed in the packaging sandbox because its copied dependency tree lacks the `vite/client` and `node` type definitions. Run `npm install` and `npm run release:check` in the deployment folder before deploying.

## Existing student accounts
Students who already registered before this hotfix can complete enrolment by reopening the original registration link while logged in and clicking **Accept and join**. Alternatively, a tutor or administrator can assign the course unit from Enrollment Management.
