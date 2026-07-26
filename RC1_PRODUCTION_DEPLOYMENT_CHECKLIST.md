# RC1 Production Deployment Checklist

## Before deployment
- [ ] Copy `.env.example` to `.env.local` and provide real Firebase values.
- [ ] Confirm the selected Firebase CLI project is the intended production project.
- [ ] Run `npm install` or `npm ci`.
- [ ] Run `npm run release:check` successfully.
- [ ] Review Firestore rule and index changes.
- [ ] Export or back up production Firestore data.

## Deployment
- [ ] Run `firebase deploy --only firestore:rules,firestore:indexes,hosting`.
- [ ] Confirm Hosting deploy completed without warnings.
- [ ] Confirm Firestore rules timestamp changed in Firebase Console.

## Post-deployment smoke test
- [ ] Admin login and dashboard load.
- [ ] Tutor login and assigned course-unit access.
- [ ] Student login and assigned learning-content access.
- [ ] Create and receive a notification.
- [ ] Mark notification read, pin it, archive it, and restore it.
- [ ] Confirm recipient cannot edit notification title/body or delete it.
- [ ] Submit and review one clinical logbook entry.
- [ ] Open Question Bank and Examination Builder.

## Rollback trigger
Rollback or halt rollout for authentication failure, cross-institution data exposure, inaccessible assigned content, rule permission regressions, or repeated application crashes.
