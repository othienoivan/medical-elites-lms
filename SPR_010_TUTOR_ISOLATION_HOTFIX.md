# SPR-010 Tutor Isolation and Subscription Reliability Hotfix

- Prevents async form reset null error on subscription plan save.
- Loads only active plans in subscription assignment and provides tenant/plan selectors.
- Scopes tutor attendance, announcements, timetable, finance, quiz attempts and clinical logbook reads to the authenticated tutor.
- Leaves account deletion out of scope.
- Requires matching Firestore indexes for compound owner/order queries.
