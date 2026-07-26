# V1.1 Registration Links and Module Filter Hotfix

## Corrected

- Manage Modules now carries the selected course-unit ID in the route and displays only modules linked to that course unit.
- New Module launched from a filtered module view preselects the programme and course unit and returns to the same filtered view after creation.
- Registration-link course-unit matching now normalises numeric, labelled, and Roman year/semester values.
- Legacy publication values such as `published`, `true`, `active`, `1`, and `yes` are recognised as published.
- Tutor, institution, programme, class, and course-unit link types now use appropriate required fields.
- Tutor and institution links can be generated without academic allocation.
- Programme links can allocate all published units in a programme, with optional year/semester narrowing.
- Class links require programme, year, semester, and at least one published course unit.
- Course-unit links require explicit manual course-unit selection.
- Removed the raw Preview Data button from the Visual Lesson Builder.
