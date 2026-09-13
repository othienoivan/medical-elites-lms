# Medical Elites LMS — Professional Exams, Quiz Management, Cohorts & Progression Batch

Date: 2026-08-23

## 1. Professional Examination Builder

- UHPAB is now the default Professional Examination Builder template.
- UAHEB has been removed from the live Professional Examination Builder template options and model.
- Default UHPAB structure:
  - Section A: exactly 30 MCQs × 1 mark = 30 marks.
  - Section B: exactly 2 structured questions × 5 marks = 10 marks.
  - Section C: essay questions totaling exactly 60 marks.
- Other examination templates remain available only when the tutor explicitly selects one.
- Tutors can select a Course Unit and choose which UHPAB sections AI should populate.
- The AI workflow first selects suitable existing questions already linked to that Course Unit, then generates any deficit.
- Newly AI-generated items are saved as draft Professional Medical Question Bank items for tutor review.
- The builder validates the UHPAB section structure before save/publish.
- For automatic generation of Section C, the initial AI composition is 3 essay questions × 20 marks; tutors may edit the essay distribution as long as Section C totals 60 marks.

## 2. Quiz and Question Bank Management

- Quiz Builder now supports explicit lesson placement in addition to module placement.
- Assigning a quiz updates the selected lesson/module `quizId` and `quizRequired` state used by student progression.
- Quiz Bank includes Course Unit filtering and sorting.
- Professional Medical Question Bank includes Course Unit filtering and sorting.
- Permanent Quiz deletion is performed by a trusted Cloud Function and detaches the quiz from lessons/modules.
- Permanent Question deletion removes the question from reusable quizzes and Professional Examinations before deleting the question record.

## 3. Gradebook and Class Analytics

- Tutor Gradebook now includes a Cohort / Registration Link filter.
- Class Analytics now includes the same cohort filter.
- Cohort identity supports registration-link cohorts and legacy/ungrouped attempts.
- Gradebook and analytics Excel exports include cohort information.

## 4. Student Progression Override

- Tutors can manually grant a specific student access to the next lesson or module without changing the failed assessment result.
- The override requires a reason and is restricted to a tutor-owned assessment (or an authorized administrator).
- Overrides are recorded in `progressionOverrideAudits`.
- The student receives an in-app notification with a link to continue learning.
- Lesson and module progression logic honors student-specific manual unlocks.

## 5. Automatic Continuation After Module Completion

- Completing a module now resolves the next published module and routes the learner directly into it.
- If no next module exists, the learner is routed back to the Course Unit/library as appropriate.
- Post-quiz routing checks for a required module-level assessment before allowing the student to move into the next module, preventing assessment bypass.

## Validation

Changed TypeScript/TSX files passed local syntax/transpile validation. A clean dependency installation is required for the repository's full `npm run typecheck` and build checks before deployment.

## Deployment

Run from the project root:

```powershell
npm ci

cd functions
npm ci
npm run build

cd ..
npm run typecheck
npm run build

firebase deploy --only hosting,functions --dry-run
firebase deploy --only hosting,functions
```

## Recommended Acceptance Tests

1. Open a new Professional Examination: UHPAB should be selected by default and UAHEB should not appear.
2. Select a Course Unit, generate Sections A/B/C, and verify 30 MCQs, 2 × 5-mark structured questions, and 60 marks of essays.
3. Assign a Quiz Bank quiz to a lesson and verify that the lesson requires that quiz.
4. Permanently delete a test quiz and verify it disappears from the Quiz Bank and is detached from its lesson/module.
5. Filter/sort both Quiz Bank and Professional Medical Question Bank by Course Unit.
6. Filter Gradebook and Class Analytics by a registration-link cohort and confirm only that cohort is included/exported.
7. From a failed student's performance/manual-marking view, grant access to the next lesson/module and verify only that student is unlocked.
8. Complete the last learning item in a module and verify the LMS opens the next module automatically, unless a required module assessment must first be passed.
