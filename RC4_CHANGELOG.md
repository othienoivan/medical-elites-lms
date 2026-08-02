# Medical Elites LMS v1.0 RC4

## Public website and branding

- Added public About Us, Privacy Policy, Terms & Conditions, Testimonials, and Contact pages.
- Added an Our Partners section with neutral placeholders for future institutional partners.
- Updated the public navigation and footer.
- Footer now displays: © current year Medical Elites and “Made with ♥ from Othieno Ivan.”
- Added role-based Student, Tutor, and Administrator login portal selection.
- Added Student registration, Tutor access requests, and invitation-only Administrator access requests.
- Tutor requests create inactive accounts pending administrator approval.
- Added version and public contact information.

## Security

- Public users cannot create administrator accounts.
- Tutor requests cannot self-assign tutor privileges.
- Firestore user-profile creation rules restrict new profiles to safe student-role records and validate requested access type.
