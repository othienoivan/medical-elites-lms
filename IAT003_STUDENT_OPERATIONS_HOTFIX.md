# IAT-003 Student Operations Hotfix

Version: 1.1.0-alpha.8

## Corrections

- Added full student profile editing at `/tutor/students/:studentId/edit`.
- Preserved Firebase Auth identity and existing enrolments during profile updates.
- Added Edit Profile actions to the student directory and student profile page.
- Corrected student timetable visibility to accept both course-unit and programme enrolment matches.
- Added a shared Messages shortcut beside the notification bell in Tutor and Administrator layouts.
- Added persistent Messages and Notifications quick access for authenticated student pages.

## Retest

1. Edit a student profile and refresh.
2. Confirm the linked student can still log in and retains enrolments.
3. Create a timetable entry under an enrolled course unit or programme.
4. Confirm the student can see it at `/timetable`.
5. Confirm Messages and Notifications controls appear across Tutor, Administrator, and Student workspaces.
