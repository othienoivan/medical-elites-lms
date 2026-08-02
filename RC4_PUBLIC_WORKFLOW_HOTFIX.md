# RC4 Public Workflow Hotfix

## Corrected

- Removed nested React Router links from the public logo to eliminate invalid `<a>` inside `<a>` markup.
- Increased contrast in the About page founder section.
- Contact enquiries are now saved to the `contactRequests` Firestore collection instead of relying only on a local mail client.
- Added secure Firestore rules for public contact-form submissions and administrator-only review.
- Added `emailNormalized` ownership support to student identity synchronization rules.
- Tutor registration requests now redirect to a pending-approval state instead of presenting a misleading student-role mismatch.
- Login now distinguishes an unapproved tutor request from an ordinary wrong-portal login.
- Quiz creation and editing now verify that at least one referenced Question Bank document exists and has valid marks.
- Quiz builders now display the exact validation failure when invalid or deleted question references are detected.

## Required deployment

Deploy Firestore rules after copying the patch:

```powershell
firebase deploy --only firestore:rules
```
