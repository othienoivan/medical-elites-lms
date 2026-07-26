# Student Identity Architecture Stabilization

## Canonical identity model

- Firebase Authentication UID is the canonical student identity.
- `users/{uid}` stores the login profile and access scope.
- `students/{uid}` stores the School Management directory record.
- `registrationLinkEnrollments/{linkCode}_{uid}` stores the immutable link-claim relationship.
- Registration-link claiming creates or repairs both canonical documents atomically.

## Key correction

The previous login synchronizer queried the entire `students` collection by `authUid` and email. Those discovery queries conflict with least-privilege Firestore rules for student accounts. The synchronizer now reads only `students/{uid}`, which is the exact document path permitted to the authenticated learner.

Legacy student records whose document IDs are not Auth UIDs should be migrated administratively rather than discovered client-side by students.
