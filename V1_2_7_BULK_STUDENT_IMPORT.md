# Medical Elites LMS v1.2.7 — Bulk Student Import

## Included
- Excel/CSV student import page
- Downloadable XLSX template
- Header alias recognition
- Required-field and email validation
- Programme resolution by ID or title
- Existing and in-file duplicate detection
- Automatic programme/year/semester course-unit allocation
- Row-by-row import progress and result reporting
- Invalid-row skipping

## Important boundary
This release creates student academic records in Firestore. It does not create Firebase Authentication users or email passwords. Account invitation/provisioning requires a privileged Cloud Function using the Firebase Admin SDK and should not be performed from the browser.

## Deploy
1. Extract over the current project.
2. Run `npm install`.
3. Run `npm run build`.
4. Deploy with `firebase deploy --only hosting`.

## Test
- Download the template from Student Directory > Bulk Import.
- Import a file containing one valid row and one invalid row.
- Confirm only the valid row is created.
- Confirm programme, year, semester and allocated course units are correct.
- Repeat the file and confirm duplicates are blocked.
