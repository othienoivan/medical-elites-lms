# V1 Student Learning Content Access Hotfix

## Root causes

1. Registration-link claiming updated `users/{uid}` and `students/{uid}`, but the React authentication context retained the old pre-claim user profile in memory. Student course loaders therefore continued to see an empty `assignedCourseUnitIds` array.
2. Student module and quiz loaders attempted broad collection reads or tutor-oriented ownership queries. Firestore correctly rejected those requests because every returned document could not be proven accessible to the student.
3. `useStudentLearningAccess` used an all-or-nothing `Promise.all`, so one optional legacy enrollment query could clear otherwise valid canonical student access.
4. Messaging contact discovery attempted to list the entire users collection, creating an unrelated permission warning during student login.

## Corrections

- Added a live `onSnapshot` listener for `users/{uid}` in `AuthContext` so registration-link and tutor assignment changes take effect without signing out.
- Student module queries are now restricted to assigned `courseUnitId` / legacy `courseId` values in Firestore-compatible chunks.
- Student quiz queries are now restricted to assigned course-unit IDs.
- Canonical `students/{uid}` assignments are accepted by Firestore rules as a safe fallback to the user profile assignment list.
- Enrollment sources are loaded independently; failure of an optional legacy query no longer removes canonical student access.
- Messaging contacts are treated as optional so a restricted directory query no longer breaks conversation loading.

## Deployment

```powershell
npm install
npm run build
firebase deploy --only firestore:rules,hosting
```

After deployment, refresh the student browser once. Existing approved registration-link assignments are supported; a new student account is not required.
