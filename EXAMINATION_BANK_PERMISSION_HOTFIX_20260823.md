# Examination Bank Permission Hotfix — 2026-08-23

- Replaced the unfiltered `examinations` collection scan with tutor-scoped ownership/assignment queries.
- Added secure compatibility lookup for legacy examination drafts that stored the authenticated tutor email in `createdBy`.
- New examination drafts now persist `ownerUserId`, `createdByUid`, `createdBy`, and `assignedTutorIds` using the tutor UID.
- Tightened examination create rules so ownership metadata is internally consistent.
- Existing legacy drafts remain readable only when `createdBy` equals the authenticated user's verified token email.
