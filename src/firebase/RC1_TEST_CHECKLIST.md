# Medical Elites LMS v1.0 RC1 Test Checklist

## Authentication and roles

- [ ] Student registration creates a student role profile.
- [ ] Tutor account can access `/tutor`.
- [ ] Student account is blocked from every `/tutor/*` route.
- [ ] Inactive accounts are redirected to Unauthorized.
- [ ] Sign-out and sign-in preserve the intended redirect.

## Student identity and enrolment

- [ ] Student login links the student record by email.
- [ ] Active enrolments contain the Firebase Auth UID.
- [ ] Student sees only enrolled course units.
- [ ] Unenrolled course-unit URLs are blocked.

## Attendance and timetable

- [ ] Tutor saves an attendance register.
- [ ] Saved register persists after page refresh.
- [ ] Student sees the same attendance record.
- [ ] Tutor edits and resaves an existing register.
- [ ] Student sees only timetable entries for enrolled units.

## Assessments

- [ ] Selecting one bank question selects only that question.
- [ ] Student submits a quiz once without a false save error.
- [ ] Submitted assessment disappears from Available and Upcoming.
- [ ] Tutor sees the submission in Submission Inbox.
- [ ] Tutor marks and releases results.
- [ ] Released submission displays Marked and supports Remark.
- [ ] Student sees result slip only after release.

## Finance

- [ ] Tutor creates a fee structure.
- [ ] Tutor issues an invoice once per student and structure.
- [ ] Partial payment recalculates balance correctly.
- [ ] Overpayment is rejected.
- [ ] Receipt number is generated.
- [ ] Student sees invoice, payment, balance, and notification.

## Clinical logbook

- [ ] Student saves a draft.
- [ ] Student submits an entry.
- [ ] Tutor approves, rejects, or returns the entry.
- [ ] Student receives the correct notification.
- [ ] Student cannot modify an approved entry.

## Messaging and notifications

- [ ] Student can start a permitted conversation.
- [ ] Sender cannot alter conversation participants after creation.
- [ ] Recipient can mark a message read but cannot alter its body.
- [ ] Unread notification count updates correctly.

## AI

- [ ] Student AI responds to an educational prompt.
- [ ] Student is blocked from tutor-only AI modes.
- [ ] Tutor AI generates an assessment draft.
- [ ] AI usage log is written.
- [ ] Invalid API key, quota failure, and timeout show safe errors.

## Build and deployment

- [x] `npm run lint`
- [x] `npm run build`
- [ ] `cd functions && npm install && npm run build`
- [ ] `firebase deploy --only firestore:rules`
- [ ] `firebase deploy --only functions:medicalElitesAi`
- [ ] Smoke-test deployed hosting URL.
