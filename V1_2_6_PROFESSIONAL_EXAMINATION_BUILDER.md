# Medical Elites LMS v1.2.6 — Professional Examination Builder

## Implemented
- Draft, published and archived examination status filtering.
- Examination delivery settings: duration, pass mark, attempts, opening and closing date/time.
- Security controls for question and option randomisation.
- Immediate-result visibility setting.
- Candidate-paper and marking-guide preview switch.
- Browser print and Save-as-PDF workflow.
- Creation of 2–4 shuffled examination versions.
- Archive workflow.
- Validation for pass mark, scheduling window and total marks.

## Deployment
1. Extract over the current project.
2. Run `npm install`.
3. Run `npm run build`.
4. Deploy with `firebase deploy --only hosting`.

No Cloud Function or Firestore rule deployment is required for this increment.
