# Messaging, Notifications and Attendance Reliability Batch

## Attendance corrections
- Added `attendanceRecords`, a flat per-student attendance collection.
- Student attendance now queries records directly by Firebase Auth UID or normalized email.
- Attendance sessions remain the tutor-facing register source.
- Existing attendance sessions are migrated into student-readable attendance records when Attendance Management opens.
- Saved registers now remain visible after page refresh in a Saved Attendance Registers table.
- Tutors can reopen and update a register for a course unit and date.
- Saving no longer clears the current register.

## Messaging
- Added one-to-one conversations between authenticated LMS users.
- Students can start conversations with tutors and administrators.
- Tutors can message students and other staff.
- Sending a message creates an in-app notification for the recipient.

## Notifications
- Added notification centre for students and tutors.
- Added unread notification bell to student and tutor headers.
- Added mark-one and mark-all-as-read actions.

## Routes
- `/messages`
- `/notifications`
- `/tutor/messages`
- `/tutor/notifications`

## Required deployment
Deploy the updated rules:

```powershell
firebase deploy --only firestore:rules
```
