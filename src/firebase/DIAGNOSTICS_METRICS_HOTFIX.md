# Diagnostics Metrics Hotfix

- Added explicit Firestore rules for the `courseUnits` collection.
- Prevented one denied or unavailable metrics collection from zeroing all readiness totals.
- Added safe per-collection metric reads and activity reads.
- Added student-count fallback to student-role user profiles for legacy data.
- No schema migration is required.
