# Professional Examination Builder Core Upgrade

Implemented:
- Examination type and paper template selection.
- Academic year, year of study and semester metadata.
- Target-mark validation before saving or publishing.
- Empty-section validation.
- Live examination blueprint by section, question count, marks and percentage.
- Candidate paper and examiner marking-guide previews.
- Draft and publish workflow retained.
- Reusable version-generation service supporting Versions A-D with shuffled question order.
- Existing question-bank integration retained.

The builder prevents publication when the calculated paper total differs from the configured target marks.
