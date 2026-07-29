# V1 Programme-Based Automatic Course Allocation

## Purpose
Prevent tutors from accidentally creating student registration links without the correct semester curriculum.

## Behaviour
- Automatic allocation is the default and recommended mode.
- Tutor selects programme, year of study, and semester.
- The LMS selects every published course unit matching those academic fields.
- Modules belonging to those course units are selected automatically.
- Unpublished course units are excluded because students cannot access unpublished curriculum.
- Manual allocation remains available for exceptional class arrangements.
- The registration link stores a concrete snapshot of course-unit and module IDs for secure Firestore authorization.

## Important design decision
The system does not grant broad programme-wide access at runtime. It resolves programme/year/semester into explicit IDs when the link is created. This preserves least-privilege access and makes every student's assignment auditable.
