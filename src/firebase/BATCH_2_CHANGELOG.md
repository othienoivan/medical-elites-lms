# Batch 2 — Authentication, Roles and Route Protection

## Added

- Firestore-backed user profile loading in `AuthContext`.
- `student`, `tutor`, and `admin` role model.
- Active/inactive account enforcement.
- Role-aware `ProtectedRoute`.
- Unauthorized access page.
- Tutor/admin protection on every `/tutor/*` route.
- Firestore security rules and Firebase configuration.
- Safe Firebase error typing in login and registration.

## Changed

- New user profiles now include `isActive: true`.
- Student learning routes explicitly allow authenticated LMS roles.
- Public registration remains student-only.

## Verification

- `npm run build`: PASS.
- Authentication-related ESLint errors: resolved.
- Remaining lint findings are pre-existing hook-effect issues and one quiz dependency warning.

## Required manual action

Promote the owner/tutor account in Firestore by setting:

```json
{
  "role": "tutor",
  "isActive": true
}
```

Then deploy `firestore.rules`.
