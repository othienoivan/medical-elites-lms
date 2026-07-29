# RC2 Curriculum AI Import Changelog

## Implemented
- Added Curriculum AI Import panel to `/tutor/curriculum`.
- Added Administrator curriculum import page at `/admin/curriculum`.
- Added Administrator sidebar navigation entry.
- Added DOCX text extraction with `mammoth`.
- Added PDF text extraction with `pdfjs-dist`.
- Added automatic course-unit and module detection with editable preview.
- Added manual add, edit, and delete controls before import.
- Added target programme selection.
- Added Firestore batch creation for course units and modules.
- Added duplicate and empty-item skipping.
- Added `curriculumImports` audit records.
- Added 20 MB upload validation and readable error states.

## Validation
- `npm run build` passed.
- `npm run lint` passed.

## IAT Notes
- Test with both a structured DOCX curriculum and a selectable-text PDF.
- Scanned/image-only PDFs require OCR and will report that no readable text was found.
- Confirm Firestore security rules permit Tutor/Admin writes to `courses`, `modules`, and `curriculumImports`.
