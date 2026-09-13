# AI Examination Generation Permission Hotfix — 2026-08-23

## Problem
The Professional Examination Builder AI workflow successfully generated content but failed while saving newly generated questions with `Missing or insufficient permissions`.

## Root cause
Firestore question creation requires `ownerUserId`, `createdByUid`, and `createdBy` to match the authenticated tutor. The examination AI mapper supplied `ownerUserId` and `createdByUid` but omitted `createdBy`, so direct client-side batch writes were rejected. Institution-scoped tutors could also encounter a mismatch when a selected Course Unit belonged to another institution they legitimately teach.

## Fix
- Added `createAiExaminationQuestionsTrusted` Cloud Function.
- Requires authentication and an active tutor/admin account.
- Tutors must own or be assigned to the selected Course Unit.
- Server stamps owner/creator/assigned tutor and Course Unit institution metadata.
- AI-generated questions remain drafts in the Professional Medical Question Bank for tutor review.
- Examination Builder now uses the trusted callable instead of direct Firestore batch creation.
- Undefined client fields are removed before callable serialization.

## Deployment
Deploy both Hosting and Functions.
