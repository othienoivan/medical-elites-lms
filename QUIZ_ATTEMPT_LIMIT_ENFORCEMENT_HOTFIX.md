# SPR-003 — Quiz Attempt Limit Enforcement

## Scope

This release enforces the tutor-configured maximum quiz attempts in the learner interface, trusted backend, Firestore rules and assessment catalogue.

## Behaviour

- Only successfully submitted attempts count toward the configured maximum.
- A timed attempt submitted automatically at expiry counts as a completed attempt.
- Students can retake a quiz while attempts remain.
- After the limit is reached, start, retake and submit actions are blocked.
- The learner sees attempts used, maximum attempts and attempts remaining.
- Module quiz links now open the guarded assessment entry page before the quiz player.
- The Cloud Function checks and records the limit transactionally, preventing browser refresh, parallel tabs, direct calls or another browser from exceeding the limit.
- Submitted attempts cannot be created or deleted by browser clients.
- Tutor updates are restricted to manual marking and release metadata; submitted answers and attempt sequence remain immutable.

## Data and index changes

A composite `quizAttempts` index was added for:

- `studentId` ascending
- `quizId` ascending

Completed attempts now expose optional `attemptNumber` and `maximumAttempts` fields in the TypeScript model.

## Deployment

```powershell
npm install
npm run release:check
firebase deploy --only functions:submitQuizAttempt,firestore:rules,firestore:indexes,hosting
```
