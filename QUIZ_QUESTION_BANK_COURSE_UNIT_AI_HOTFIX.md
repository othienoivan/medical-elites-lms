# Quiz and Question Bank Course-Unit / AI Hotfix

## Problems corrected

1. Tutor authoring pages loaded only published course units and modules. Existing draft or imported curriculum records therefore disappeared from the Course Unit and Module selectors.
2. Course Unit selectors were disabled until a programme was selected, making valid tutor-owned units inaccessible when legacy data did not have a perfectly matched programme link.
3. AI-generated question batches included optional properties with JavaScript `undefined` values. Firestore rejects `undefined`, causing `WriteBatch.set()` to fail on fields such as `courseUnitId`.

## Changes

- Create Quiz and Create Question now load all course units and modules available to the tutor, including unpublished authoring records.
- Course Unit can be selected directly; choosing it synchronizes the programme automatically when a programme link exists.
- Question create, update and bulk-create operations recursively remove undefined fields while preserving Firebase sentinel values and other non-plain objects.
- AI quiz generation falls back to the selected module's stored programme/course-unit IDs when the corresponding selector record is unavailable.

## Validation checklist

1. Sign in as a tutor.
2. Open Create Quiz and confirm Course Unit lists tutor-managed units.
3. Select a course unit, then a module.
4. Generate questions with AI and confirm questions are saved and selected without the Firestore `undefined` error.
5. Open Question Bank > New Question and confirm the Course Unit list is available.
6. Create and edit a question with optional programme/module fields left blank and confirm it saves successfully.
