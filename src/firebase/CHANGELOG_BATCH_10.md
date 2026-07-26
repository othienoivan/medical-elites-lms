# Batch 10 — Attendance Visibility + Timetable

## Attendance correction
- Attendance registers now preserve the Firebase Auth UID from either the student record or enrolment.
- Existing attendance sessions are repaired automatically when a tutor opens Attendance Management.
- Student attendance can then be authorised and displayed through the existing Firestore rule.

## Timetable module
- Tutor timetable manager at `/tutor/timetable`.
- Student timetable at `/timetable`.
- Course unit, day, time, venue, academic year, semester, class group and status fields.
- Basic venue-clash warning.
- Student timetable filtered to active enrolled course units.
- Dashboard and tutor sidebar links.
- Firestore rules for `timetableEntries`.
