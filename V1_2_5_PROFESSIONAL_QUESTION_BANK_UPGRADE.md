# Medical Elites LMS v1.2.5 — Professional Question Bank Upgrade

## Delivered

- Existing questions can be viewed, edited, duplicated and soft-deleted.
- Full examination/question imports now accept PDF, DOCX, TXT, CSV and JSON.
- PDF and DOCX text extraction uses the dependencies already present in the LMS.
- Examination parser detects numbered questions, A–H options, answer keys, explanations/marking guides and marks.
- Imported questions are saved as drafts by default for tutor review.
- AI Question Generator added to the Question Bank.
- Tutors can choose topic, number, question type, difficulty and Bloom level.
- AI generation is grounded in tutor-supplied lesson/reference content.
- AI-generated questions are saved as drafts and never auto-published.
- Maximum import batch: 400 questions. Maximum AI batch: 50 questions.

## Recommended examination import format

```text
1. Which drug is recommended for first-line treatment of uncomplicated malaria? (1 mark)
A. Quinine
B. Artemether-lumefantrine
C. Chloroquine
D. Doxycycline
Answer: B
Explanation: Artemether-lumefantrine is the recommended first-line ACT in the relevant guideline.
```

## Deployment

```powershell
npm install
npm run build
firebase deploy --only hosting
```

The existing `medicalElitesAi` Cloud Function must already be deployed for AI generation. No new function deployment is required by this package.

## Validation checklist

1. Open Tutor → Question Bank.
2. Import a DOCX or PDF containing numbered questions and answer lines.
3. Confirm imported questions appear as Draft.
4. Open one question, edit it and save.
5. Delete one question and confirm it disappears from the active bank.
6. Use Generate with AI with at least 80 characters of source content.
7. Confirm generated questions appear as Draft and can be edited before publishing.
