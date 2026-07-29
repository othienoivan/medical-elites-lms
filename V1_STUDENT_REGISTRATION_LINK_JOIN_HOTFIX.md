# V1 Student Registration Link Join Hotfix

## Corrected

- Allows a student to read only the deterministic registration-link enrollment document `{linkCode}_{studentUid}` used by the claim transaction.
- Allows a student to increment only `registrationCount` and `updatedAt` on an active registration link, and only when the same atomic transaction creates that student's enrollment document.
- Prevents arbitrary registration-link edits by students.
- Validates that the enrollment document ID, authenticated UID, and registration link code agree.
- Allows student identity synchronization to read and link legacy enrollment records through the associated School Management student record after `authUid` is linked.
- Makes linked-student rule checks safe when optional legacy fields are absent.

## Validation

- `npm run lint` passed.
- `npm run build` passed.
