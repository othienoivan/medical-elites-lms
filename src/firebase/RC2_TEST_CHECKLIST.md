# RC2 Test Checklist

## Toasts
- [ ] Save attendance and confirm a green toast appears.
- [ ] Trigger a validation message and confirm an amber toast appears.
- [ ] Trigger a permission/network failure and confirm a red toast appears.
- [ ] Confirm toasts can be dismissed and disappear automatically.

## Loading
- [ ] Navigate directly to a lazy-loaded route and confirm the page skeleton appears.
- [ ] Confirm screen readers receive a loading label.

## Regression
- [ ] Tutor-to-student and student-to-tutor messages send and refresh.
- [ ] Attendance persists after refresh and appears for the student.
- [ ] Quiz submission creates one completed attempt.
- [ ] Finance invoice, payment, receipt and balance remain correct.
- [ ] AI Assistant responds for tutor and student.
- [ ] Clinical Logbook submit/review notification works.

## Build
- [ ] `npm run lint`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] `cd functions; npm run build`
