# Authentication and Role Setup

## Implemented roles

- `student`
- `tutor`
- `admin`

New public registrations are always created as `student` accounts.
Tutor and administrator privileges must be assigned by a trusted administrator in Firestore or through a future admin console.

## Promote an existing account

1. Open Firebase Console.
2. Open Firestore Database.
3. Open the `users` collection.
4. Open the document whose ID equals the Firebase Authentication UID.
5. Change `role` from `student` to `tutor` or `admin`.
6. Ensure `isActive` is `true`.
7. Sign out and sign in again.

Do not allow users to select `tutor` or `admin` during public registration.

## Deploy security rules

Install Firebase CLI and authenticate, then run:

```bash
firebase deploy --only firestore:rules
```

The included rules prevent students from changing their own role and restrict tutor routes and protected data operations.

## Important

Client-side route protection improves user experience but does not replace Firestore security rules. Deploy the included `firestore.rules` before using the LMS with real student information.
