# Sprint 1 – Milestone 2: Academic Assignment Engine

## Scope completed

- Programme, year-of-study and semester matching for course-unit allocation.
- Automatic assignment of matching course units during student registration.
- Manual course-unit assignment/removal from the student edit screen.
- **Apply Year/Semester Units** action to reset a learner to the current curriculum placement.
- Student identity synchronization between `students/{studentId}` and `users/{uid}`.
- Registration-link synchronization of programme, year, semester, institution, tutor links and course units.
- Student course visibility based on direct assignments and active enrolment records.
- Tutor course-unit visibility based on ownership and `assignedTutorIds`.
- Tutor-created modules, lessons, quizzes and questions inherit the tutor assignment.
- Firestore authorization for programme/course/student academic scope, including safer handling of legacy profiles.

## Academic matching rules

A course unit is eligible when:

1. `course.programmeId` equals the student's `programmeId`.
2. The normalized course year matches the normalized student year, when both are present.
3. The normalized course semester matches the normalized student semester, when both are present.

The normalizer accepts common values such as `1`, `Year 1`, `I`, `Semester II`, and `Sem 2`.

## Deployment

```powershell
npm install
npm run build
firebase deploy --only firestore:rules,hosting
```

## Required verification

1. Create or edit a student and select programme, year and semester.
2. Click **Apply Year/Semester Units** and confirm only matching course units are selected.
3. Save the student and sign in as that student.
4. Confirm **My Course Units** contains only the assigned units.
5. Remove one course unit, save, sign in again, and confirm it is absent.
6. Sign in as Tutor A and confirm Tutor B's course units and marking work are not listed.
7. Register a new learner through an academic registration link and confirm placement and units are inherited.
8. Attempt to open another programme's course URL as a student and confirm access is denied or the record is not returned.

## Build note

The source was statically audited for the assignment engine. A complete local dependency installation could not be performed in the packaging environment because its internal npm mirror does not contain `zod-validation-error@4.0.2`. Run the build in the deployment workstation before Firebase deployment.
