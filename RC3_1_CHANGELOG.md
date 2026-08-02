# Medical Elites v1.3.0 RC3.1

## Curriculum Designer foundation
- Added `/admin/curriculum-designer` inside the Administrator workspace.
- Displays Programme → Course Unit → Module hierarchy.
- Added curriculum search and expandable academic tree.
- Added programme, course-unit, and module summary totals.

## Learning Package Builder foundation
- Added `/tutor/learning-packages/:lessonId`.
- Added structured lesson metadata, learning objectives, duration, and difficulty.
- Added package quality scoring and publication readiness checks.
- Added direct access from Lesson Manager to each lesson package.
- Reuses the existing visual block builder for resources, activities, assessments, and clinical content.

## Architecture cleanup
- Removed the Office conversion service directory and deployment scripts.
- Removed obsolete Cloud Run/Eventarc conversion documentation.
- Kept the existing PDF-first resource workflow and explicit-download behavior.

## Version
- Updated to `1.3.0-rc3.1`.
