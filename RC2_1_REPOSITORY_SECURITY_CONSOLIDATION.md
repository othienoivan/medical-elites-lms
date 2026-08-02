# RC2.1 Repository & Security Consolidation

## Scope completed

- Added `src/firebase/repositoryScope.ts` as the shared tenant/owner-scoped query boundary.
- Added `src/services/permissionService.ts` for consistent tutor ownership and administrator tenant checks.
- Removed broad list reads from examinations, announcements, and timetable repositories.
- Updated their hooks to pass the authenticated active access scope.
- Added canonical tenant and ownership metadata to newly created examinations, announcements, and timetable entries.
- Added static regression tests covering tenant scoping, tutor ownership, and hook integration.

## Security behavior

- Tutors load only records they own or are explicitly assigned.
- Institution administrators and students load only records in the active tenant/institution workspace.
- Protected repositories fail closed when no authenticated access scope or tenant workspace is available.
- Public catalogue repositories remain outside this shared operational boundary.

## Repository audit findings

### Consolidated in this batch

- Examinations
- Announcements
- Timetable

### Already scoped before this batch

- Attendance tutor lists
- Finance tutor lists
- Quiz attempts and gradebook
- Clinical logbook tutor lists
- Lessons, modules, programmes, course units, quizzes, and question bank

### Deliberately privileged/global

- Platform metrics and Super Admin platform collections
- Diagnostics probes
- Public contact and catalogue submission paths

### Follow-up work

- Move identity-link repair operations behind trusted Admin Cloud Functions.
- Consolidate messaging participant discovery and institution-core administrative queries.
- Migrate remaining legacy records without `tenantId` to canonical tenant metadata.
