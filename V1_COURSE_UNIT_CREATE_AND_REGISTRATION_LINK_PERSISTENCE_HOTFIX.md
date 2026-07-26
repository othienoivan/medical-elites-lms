# V1 Course Unit Creation and Registration Link Persistence Hotfix

## Corrected

- Firestore no longer receives `undefined` for `institutionId` during course-unit creation.
- Course-unit repository strips undefined fields before create/update operations.
- Missing institution IDs are stored explicitly as `null` for legacy tutor profiles.
- Registration-link loading no longer uses `orderBy(createdAt)` with the ownership filter.
- Tutor registration links are sorted client-side, removing the composite-index dependency and ensuring links reappear after logout/login.
