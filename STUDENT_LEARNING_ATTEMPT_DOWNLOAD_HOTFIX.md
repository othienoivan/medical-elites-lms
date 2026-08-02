# Student Learning, Quiz Attempts and Download-Only Resources Hotfix

## Included changes

### Module progress actions
- Not started: **Start Module**
- Started but incomplete: **Continue Learning**
- Completed: **Review Module**
- Module starts are persisted in `enrollments.startedModules`.
- Module completion is persisted by the trusted `completeModuleLearning` callable.
- Passing a required module quiz also records module completion.

### Quiz attempt enforcement
- Added the `submitQuizAttempt` Cloud Function.
- Tutor-defined `attemptsAllowed` is checked atomically in a Firestore transaction.
- Only completed submissions count.
- Timed expiry submissions use the same protected endpoint.
- Browser clients can no longer create `quizAttempts` directly.
- The quiz screen displays attempts used, maximum attempts and attempts remaining.
- Exhausted learners cannot reopen or resubmit the quiz.

### Download-only PDF and PowerPoint resources
- Removed PDF and PowerPoint in-browser lesson previews.
- Removed embedded viewers, preview tabs and preview controls for these resource types.
- Resources display file name, type, available size metadata and a Download button.
- Word document handling is unchanged.

### Course-unit recovery
- The Course Unit Not Found page now links to the published-only course-unit catalogue.
- A Return to Dashboard action is also available.

### Cloud Storage security
- The included `storage.rules` is production, role-aware and default-deny.
- Deploy it before the Firebase test-mode expiry date.

## Validation completed
- 114 automated tests passed.
- Firebase Functions TypeScript build passed.
- Modified frontend TypeScript/TSX files passed syntax transpilation.
- A full frontend dependency build must still be run on the deployment workstation.

## Deployment

```powershell
npm install
npm run build

cd functions
npm install
npm run build
cd ..

firebase deploy --only functions:submitQuizAttempt,functions:completeModuleLearning,firestore:rules,storage,hosting
```
