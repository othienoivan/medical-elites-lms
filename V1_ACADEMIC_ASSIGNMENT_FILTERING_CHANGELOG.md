# V1 Academic Assignment and Filtering

## Implemented
- Automatically assigns course units during student registration using programme, year of study and semester.
- Adds manual course-unit assignment and removal controls to the student edit screen.
- Includes an **Apply Year/Semester Units** action to reset assignments to the matching curriculum.
- Synchronizes the School Management student placement into the linked Firebase user profile on student login.
- Synchronizes programme, assigned course units, academic year, year of study, semester, institution and tutor links.
- Reloads the student user profile after synchronization so access is effective immediately.
- Extends student learning access to recognize direct School Management assignments in addition to enrollment records.
- Makes Firestore programme and course assignment checks safe for legacy user profiles with missing arrays.

## Deployment
```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

## Test
1. Tutor edits a student and selects programme, year and semester.
2. Click **Apply Year/Semester Units**, adjust any individual units, then save.
3. Student signs out and signs back in.
4. Student opens **My Course Units** and sees only the selected units.
5. Remove one unit as tutor, save, then have the student sign in again and confirm it is absent.
