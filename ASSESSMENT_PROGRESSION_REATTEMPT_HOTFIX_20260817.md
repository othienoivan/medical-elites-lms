# Assessment Progression & Reattempt Hotfix — 2026-08-17

## Fixed
- Removed stale `passed` flag / hard-coded 50% logic from tutor marking and reattempt decisions.
- Quiz `passMark` is now authoritative for manual marking, grant eligibility, module completion and module progression.
- Mandatory-quiz modules stay locked unless an actual completed attempt reaches the configured quiz pass mark, even if legacy enrollment data incorrectly says the module is complete.
- Tutor can grant a failed learner an extra attempt without changing the global quiz attempt limit.
- Student can request an extra attempt after exhausting all allowed attempts; tutor receives an in-app notification linking to the submitted attempt.
- Reattempt requests are marked granted when the tutor grants the extra attempt.
- Passing lesson quizzes persist lesson completion before routing onward.
- Passing students are routed to the next published lesson, then next published module, then the course page/library as appropriate.
- Lesson page honors a requested `lessonId` and defaults to the next unlocked incomplete lesson.

## Validation
- `functions` TypeScript build: PASS
- Generated `functions/lib/index.js` syntax (`node --check`): PASS
- Root frontend typecheck/build could not be executed in this extracted workspace because the bundled root `node_modules` is missing `vite/client` and `node` type definitions. Run `npm ci`, `npm run typecheck`, and `npm run build` before deployment.
