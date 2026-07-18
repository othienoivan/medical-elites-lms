# RC2.5 Automatic Office-to-PDF Conversion

## Added

- Automatic `.pptx` and `.docx` conversion to PDF after Firebase Storage upload.
- Cloud Run conversion service using LibreOffice.
- Firestore processing records in `officeDocumentPreviews`.
- Student Office document viewer that waits for conversion and opens the generated PDF.
- Automatic live updates for queued, processing, ready and failed states.
- Original Office files preserved behind explicit download buttons.
- Google Cloud CLI installer helper for Windows.
- Deployment and backfill PowerShell scripts.

## Changed

- PowerPoint and Word lesson blocks no longer require tutors to upload a PDF manually.
- Legacy `.ppt` and `.doc` files are rejected during lesson validation; use `.pptx` and `.docx`.
- Microsoft Office Online Viewer is no longer used.
- Application version updated to `1.2.0-rc2.5`.

## Infrastructure

The converter requires one Cloud Run deployment. It uses Firebase Storage upload events through Eventarc. Billing must be enabled for the Google Cloud project.
