# Announcements Module

## Added
- Tutor announcement management page at `/tutor/announcements`
- Student announcement feed at `/announcements`
- Audience targeting: students, tutors, or everyone
- Scope targeting: institution-wide, programme, or course unit
- Priority levels: normal, important, urgent
- Publish, unpublish, and delete controls
- Tutor dashboard and sidebar links
- Student dashboard quick action
- Firestore model, service, hook, and security rules

## Additional corrections
- Added `studentEmail` to the attendance record model so the identity-synchronization attendance service compiles correctly.
- Corrected the timetable loading effect and removed an unused timetable icon.

## Verification
- `npm run lint` passes
- `npm run build` passes
