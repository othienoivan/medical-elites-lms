# Assignment Access Fix

## Corrected
- Student learning access now resolves enrolments by Firebase Auth UID, legacy user ID, or the registered student's email-linked student record.
- Existing enrolments with a blank `studentAuthUid` can still be resolved through `studentId` when the student's registration email matches the signed-in Firebase account email.
- Module-linked assessments are now visible when the module belongs to an enrolled course unit.
- Firestore rules now permit a student to read their own student record and linked enrolment by authenticated email.

## Required
Deploy the included Firestore rules:

```powershell
firebase deploy --only firestore:rules
```

The email used in the student record must exactly match the Firebase Authentication account email.

## 3.0.0-rc.3 — Platform Layer
- Added isolated Super Admin Platform Console under `/platform`.
- Added tenant, tutor workspace, plan, feature flag, license, audit, support, announcement, usage, branding, roadmap and platform settings modules.
- Added Domain-Driven platform bounded context.
- Added explicit default-deny Firestore rules for RC3 collections.
- Preserved all existing institution-scoped academic routes and queries.
