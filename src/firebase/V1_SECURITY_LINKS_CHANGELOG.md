# V1 Security and Registration Links Milestone

Implemented in this build:

- Secure tutor/institution registration links with high-entropy link codes.
- Tutor registration-link management page: create, copy, QR, disable, reactivate, expiry, capacity, approval, programme/year/semester/course-unit metadata.
- Public `/join/:code` onboarding page for new and existing students.
- Automatic approved enrollment into tutor, institution, programme and course-unit assignments.
- Conflict protection: an existing different institution is never overwritten; the request becomes pending.
- Registration-link enrollment records for traceability.
- Tutor sidebar Registration Links entry.
- Persistent tutor sidebar Logout button on desktop and mobile.
- User profile fields for institution, linked tutors, programmes, course units, year, semester and onboarding source.
- Firestore rules for registration links, link enrollments, audit-log immutability, tutor-created student ownership, institution-aware administration, and narrower user/student visibility.

## Deployment

Deploy Firestore rules before testing link claims:

```bash
firebase deploy --only firestore:rules
```

Then build and deploy the web application normally.

## Important migration note

Existing records created before this milestone may not yet contain `institutionId`, `createdByUid`, `ownerUserId`, or `assignedTutorIds`. Backfill these fields before fully enforcing the same strict rules on every legacy academic collection.
