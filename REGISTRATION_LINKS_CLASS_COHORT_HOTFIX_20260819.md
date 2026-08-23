# Registration Links + Class Cohort Hotfix — 2026-08-19

## Fixed

- Class-specific registration links no longer require **Year of study** when **Manual exception** is selected. Semester remains required; Year of study is required only for automatic allocation.
- Manual exception now shows **all published course units registered under the selected programme**, instead of hiding units because of legacy/missing year/semester metadata.
- Automatic allocation remains strict: only course units with matching canonical/legacy year-of-study and semester metadata are auto-selected.
- Programme matching now supports canonical `programmeId`, legacy `programmeIds`, programme title and programme code aliases.
- Course-unit placement recognizes canonical and legacy fields (`yearOfStudy`, `studyYear`, `year`, `levelYear`, `semester`, `semesterOfStudy`, `term`).
- Published module/course-unit eligibility is normalized across boolean/string publication states.

## Multi-institution tutor links

- A tutor-owned registration link can now carry an optional institution/school context without changing link ownership.
- Tutors with multiple active institution memberships can choose the institution for the class/link.
- Claiming a tutor-owned link no longer deletes or removes a student's existing institution membership.
- Tutor workspace membership is additive, not destructive.
- Existing learner institution membership remains intact; the registration-link enrollment stores the class/institution context.

## Independent assessment cohorts

- Every registration link gets a deterministic cohort identity (`studentGroupId` / `assessmentGroupId`) based on the link code.
- Registration-link enrollments retain link name, institution, programme, academic year, year of study, semester, selected course units/modules and cohort ID.
- Quiz attempts now capture the matching approved registration-link/class context at submission time.
- Tutor Automatic Gradebook groups the same student separately by registration-link cohort.
- Automatic Gradebook and Submission Inbox include class/link filters.
- Student Performance supports a cohort query parameter so opening a gradebook row does not merge assessment results from another class/link.
- Registered Learners now displays preserved institution/class context.

## Registration link types reviewed

- Tutor link: general tutor registration; optional institution context where available.
- Institution link: requires institution/school selection.
- Programme link: programme-specific allocation; optional year/semester narrowing.
- Class link: programme + semester; automatic allocation requires year of study, while Manual exception permits explicit unit selection without forcing a year.
- Course-unit link: manual selection from all published units in the selected programme.

## Validation

- Modified TypeScript/TSX files were syntax-transpiled successfully with TypeScript 5.8.3.
- Full dependency-aware typecheck/build should be run after `npm ci` on the deployment machine.
