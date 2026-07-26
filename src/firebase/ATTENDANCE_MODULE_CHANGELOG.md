# Attendance Module

Added tutor attendance registration and student attendance history.

## New files
- src/models/Attendance.ts
- src/firebase/attendance.ts
- src/hooks/useAttendance.tsx
- src/pages/AttendanceManagerPage.tsx
- src/pages/StudentAttendancePage.tsx

## Updated
- AppRouter: /tutor/attendance and /attendance
- Tutor dashboard and sidebar
- Student identity lookup
- Firestore rules

Deploy rules after copying:
`firebase deploy --only firestore:rules`
