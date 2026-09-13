# Assessment Experience Upgrade — 2026-08-23

## Included changes

1. Lesson/module quizzes can be attached without making the pass mark a progression gate.
   - New assessment setting: **Require pass mark before learner can proceed**.
   - Existing quizzes default to required-pass behavior for backward compatibility.
   - When disabled, the learner must complete/attempt the assessment but may progress even when below the pass mark.
   - Quiz placement synchronizes `quizRequired` on the linked lesson/module to the selected setting.

2. Manual marking uses performance-aware terminology.
   - **Fully correct** when full marks/correct.
   - **Partially correct** when some marks are awarded.
   - **Needs improvement** when zero marks are awarded.
   - Removes misleading `Wrong` wording where partial credit has been awarded.

3. Student released-result review shows the complete question context.
   - Full question text.
   - All answer options where applicable.
   - Student answer.
   - Correct/model answer.
   - Marks awarded.
   - Question-specific tutor feedback and explanation.

4. Lesson/module quizzes can be untimed.
   - New **Use a timer** toggle.
   - Untimed quizzes store no active time limit (`null`).
   - Student player displays **No timer / No time limit** and does not auto-submit.
   - Timed quizzes retain countdown and auto-submit behavior.

## Deployment scope
Frontend + Cloud Functions. No Firestore rules change required for this batch.
