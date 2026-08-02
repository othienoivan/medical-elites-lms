# Medical Elites LMS v2.0.4 — Quiz Create Permission Hotfix

## Resolved

- Fixed `Missing or insufficient permissions` when saving a quiz as draft.
- Fixed the same authorization failure when publishing a quiz.
- `createQuiz()` now derives ownership from the authenticated Firebase user.
- Quiz writes now include `ownerUserId`, `createdByUid`, `createdBy`, and `assignedTutorIds`.
- Undefined optional fields are removed before Firestore writes.
- Firestore quiz-create rules now validate ownership, tutor assignment, and institution scope consistently.

## Deployment

```bash
npm install
npm run build
firebase deploy --only firestore:rules,hosting
```

Both Firestore rules and hosting must be deployed.
