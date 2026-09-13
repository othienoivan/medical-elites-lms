# Assessment Reattempt + AI Quiz Composition Batch — 17 Aug 2026

## Student-specific tutor reattempts
- Added trusted callable `grantStudentQuizReattempt`.
- Tutors can grant one additional attempt from the Manual Marking page for an unsuccessful submission.
- Grant is student-specific and quiz-specific; it does not alter the quiz's global `attemptsAllowed` value.
- A reason is required and every grant is recorded in `quizAttemptGrantAudits`.
- Current allowance is stored in `quizAttemptGrants/{studentId}_{quizId}`.
- Students receive an in-app notification when an extra attempt is granted.
- Added `getStudentQuizAttemptUsage`, making the student Take Quiz page use the backend effective limit (base attempts + tutor-granted attempts).
- `submitQuizAttempt` now enforces the effective student-specific maximum atomically.

## AI quiz composition controls
- Replaced fixed 10-MCQ AI generation with explicit count controls for:
  - MCQs
  - Short-answer questions
  - True/False questions
  - Cross Matching / EMQ questions
  - Essay questions
- AI is instructed to return the exact requested question-type composition.
- The response is validated before saving; incorrect composition is rejected rather than partially saved.
- Maximum AI generation batch is 50 questions.
- Cross Matching uses the LMS's existing EMQ/extended-matching representation for compatibility with the current question model and candidate UI.

## Validation
- Cloud Functions TypeScript build: PASS (`npm run build` in `functions/`).
- Root frontend typecheck could not execute in the packaged workspace because the extracted root `node_modules` lacks `vite/client` and Node type definitions. Run `npm ci` at project root before deployment; the user's normal deployment process restores these dependencies.
