# Mastery Retakes and Persistent Quiz Revision View — 2026-08-23

## Implemented

- Added `allowRetakesUntilPass` to lesson/module quiz configuration.
- When enabled together with mandatory pass progression, a learner who has not yet reached the pass mark always receives another attempt, regardless of the normal fixed attempt count.
- Once the learner reaches the pass mark, mastery retakes stop and normal progression is unlocked.
- Fixed-attempt quizzes remain unchanged when mastery retakes are disabled.
- AI-created lesson quizzes default to repeat-until-pass because they are configured as progression assessments.
- Added persistent **View Lesson Quiz** and **View Module Quiz** revision actions after a learner has attempted the relevant assessment.
- Added trusted `getStudentAssessmentAttemptReview` callable to reconstruct the full question set from the current Question Bank safely for the attempt owner.
- Student review displays full question text, options, submitted answer, correct/model answer when review is allowed, awarded marks, explanations, per-question tutor feedback, and overall tutor feedback.
- Tutor feedback remains hidden until results are formally released.
- Correct/model answers can be reviewed immediately when `showFeedbackImmediately` is enabled; otherwise the learner sees that the full answer review will become available with released results.
