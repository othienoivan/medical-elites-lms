# Student Course Unit Details Routing Hotfix

## Problem
Assigned course units were visible in the student portal and dashboard, but opening them displayed **Course Unit Not Found**.

## Root cause
Student cards linked to `/courses/{slug}` while the detail page searched only the public published-course catalogue. Assigned, legacy, or non-public course units could be loaded through the student's enrolment but were absent from the public query.

## Correction
- Student and dashboard course links now use the canonical Firestore course document ID.
- The details page resolves authenticated users' accessible course units as well as the public catalogue.
- Legacy slug URLs remain supported.
- Public visitors continue to see only published course units.

## Deployment
Run:

```powershell
npm install
npm run build
firebase deploy --only hosting
```

No Firestore rules or Cloud Functions changes are required.
