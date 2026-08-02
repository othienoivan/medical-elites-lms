# RC3.2 AI Curriculum Import

## Added
- Administrator route `/admin/curriculum-import`.
- Tutor route `/tutor/curriculum-import`.
- PDF, DOCX and TXT curriculum text extraction.
- Medi-assisted structured extraction of programme details, course units, credit units, contact-hour categories, learning outcomes, modules and topics.
- Human review with editable fields, confidence indicators and create/merge/skip decisions.
- Comparison summary for new, matching and changed curriculum records.
- Duplicate-aware Firestore import with programme creation, course-unit creation/merge, module creation/merge and import auditing.
- Chunked Firestore batch commits for large curricula.
- `curriculumImports` Firestore security rule.

## Safety
AI does not write directly to the academic catalogue. Every import follows Upload → Extract → AI Analyse → Compare → Human Review → Approve → Import.

## Compatibility
The legacy browser PowerPoint parser dependency was removed from the unused PowerPoint viewer. PowerPoint resources continue to require an optional PDF preview for in-browser viewing.
