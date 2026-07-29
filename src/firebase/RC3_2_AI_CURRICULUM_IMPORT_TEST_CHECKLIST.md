# RC3.2 AI Curriculum Import Test Checklist

## Access
- [ ] Administrator can open `/admin/curriculum-import`.
- [ ] Tutor can open `/tutor/curriculum-import`.
- [ ] Student is denied both routes.

## Extraction
- [ ] Upload a text-based PDF.
- [ ] Upload a DOCX curriculum.
- [ ] Upload a TXT curriculum.
- [ ] Files above 20 MB are rejected.
- [ ] Unreadable/scanned PDFs show a clear error or low-confidence fallback.

## AI Review
- [ ] Programme title/code/award/duration/department are extracted.
- [ ] Course-unit titles, codes, years and semesters are extracted.
- [ ] Credit units and contact-hour categories are extracted where present.
- [ ] Learning outcomes, modules and topics are extracted where present.
- [ ] Low-confidence items are highlighted.
- [ ] All extracted fields can be edited before approval.
- [ ] Create, merge and skip decisions work.

## Comparison and Import
- [ ] New/matching/changed record counts are displayed.
- [ ] Import creates or links the programme correctly.
- [ ] Course units persist after refresh.
- [ ] Modules persist under the correct course unit.
- [ ] Duplicate codes are not silently duplicated.
- [ ] Import summary is accurate.
- [ ] `curriculumImports` audit record is created.

## Regression
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] Existing Curriculum Designer still loads.
