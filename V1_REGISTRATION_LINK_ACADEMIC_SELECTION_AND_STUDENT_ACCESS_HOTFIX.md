# V1 Registration Link Academic Selection and Student Access Hotfix

## Root cause

Registration-link enrollment documents use `approvalStatus: "approved"`, but the student learning-access hook only accepted `status: "active"`. The hook also attempted collection-wide student email queries instead of reading the canonical `students/{authUid}` record. As a result, a student could appear correctly in School Management while the learning workspace reported that no course units were assigned.

## Fixes

- Reads the canonical student record directly from `students/{uid}`.
- Loads both standard `enrollments` and `registrationLinkEnrollments`.
- Treats `approvalStatus: "approved"` as active learning access.
- Merges course-unit access from the user profile, canonical student record, and active enrollment records.
- Replaced manual Programme ID, Programme Name, and comma-separated Course Unit ID fields in the registration-link builder.
- Added controlled dropdowns for programme, academic year, year of study, and semester.
- Added filtered multi-select lists for course units and modules.
- Requires at least one programme and one course unit before link generation.
- Stores selected module IDs in the registration link and link enrollment for future module-level access control.

## Validation

`npm run build` completed successfully using TypeScript project compilation and the production Vite build.

## Testing

1. Deploy the updated application.
2. Create a new registration link.
3. Select programme, year, semester, course units, and modules.
4. Register a new student through the link.
5. Confirm the selected course units appear under Student > Course Units.
6. Sign out and back in and confirm access persists.
