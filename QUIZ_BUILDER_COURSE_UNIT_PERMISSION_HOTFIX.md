# Medical Elites LMS v2.0.3 — Quiz Builder Course Unit & AI Permission Hotfix

## Fixed

- Quiz Builder now loads tutor-managed course units, including unpublished/draft course units.
- AI-generated questions can be written for accounts whose institution is not yet assigned.
- Question creation continues to enforce tutor/admin role, ownership, creator identity, and assigned-tutor checks.

## Files changed

- `src/pages/QuizBuilderPage.tsx`
- `firestore.rules`

## Deployment

```bash
npm run build
firebase deploy --only firestore:rules,hosting
```
