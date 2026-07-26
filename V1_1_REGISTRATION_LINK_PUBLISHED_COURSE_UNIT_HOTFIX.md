# V1.1 Registration Link Published Course Unit Hotfix

## Fixed
- Registration Links no longer relies exclusively on `courseUnit.published`.
- Legacy publication fields `isPublished`, `status`, and `publicationStatus` are recognised.
- A course unit with a published linked module is treated as eligible for registration-link assignment.
- Draft course units without any published linked module remain excluded.

## Verification
- Automated regression suite: 24/24 passed.
