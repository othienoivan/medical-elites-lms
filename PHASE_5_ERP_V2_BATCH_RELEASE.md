# Medical Elites LMS — Phase 5 ERP v2.0 Batch Release

This release integrates Phase 5 into one tutor-facing institutional workspace.

## Included in the batch

- ERP Command Centre linking all institutional modules
- Existing Attendance Management
- Existing Clinical Logbook and competency workflow
- New OSCE/OSPE station manager with Firestore persistence
- Existing Timetable Management
- Existing Finance Management
- Existing announcements, messages and notifications
- Existing gradebook, results and student transcript workflows
- New Quality Assurance and Accreditation evidence tracker
- Existing Medi AI workspace
- New Institutional Analytics dashboard using Firestore aggregate counts
- Firestore security rules for OSCE/OSPE and quality-assurance records
- Updated tutor navigation and protected routes

## Validation

Run:

```powershell
npm install
npm run release:check
```

Then deploy:

```powershell
firebase deploy --only firestore:rules,firestore:indexes,functions,hosting
```

## New routes

- `/tutor/erp`
- `/tutor/osce`
- `/tutor/quality-assurance`
- `/tutor/institutional-analytics`

## Important

The OSCE/OSPE manager in this release provides station creation, listing and deletion. Candidate rotation, live examiner scoring and reliability analysis remain advanced extensions rather than being misrepresented as complete.
