# Clinical Logbook Module

## Added
- Student clinical logbook dashboard and entry form.
- Tutor clinical review queue and detailed verification page.
- Draft, submitted, approved, returned, and rejected workflows.
- Student notification after tutor review.
- Patient confidentiality reminder and no direct patient identifiers.
- Role-aware Firestore rules.
- Student and tutor dashboard/sidebar navigation.

## Routes
- `/clinical-logbook`
- `/clinical-logbook/new`
- `/tutor/clinical-logbook`
- `/tutor/clinical-logbook/:entryId/review`

## Deployment
Run `firebase deploy --only firestore:rules` after installation.
