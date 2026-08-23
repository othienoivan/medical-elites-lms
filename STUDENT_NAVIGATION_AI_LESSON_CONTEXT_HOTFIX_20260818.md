# Student Navigation + AI Lesson Context Hotfix — 2026-08-18

## Fixed

### Student navigation duplication
- Removed page-level `StudentLayout` wrappers from student Course Units, Profile, Timetable and Donate pages.
- `StudentWorkspaceGate` is now the single source of the student navigation shell.
- Prevents duplicate desktop sidebars/mobile navigation on student standalone routes.

### AI lesson quiz false "not enough readable text"
- Added a shared `buildLessonAiContext` extractor.
- AI context now includes lesson title, description, learning objectives, structured sections, slides, clinical pearls, case scenarios, knowledge checks, rich-text/HTML block content, clinical/drug/OSCE/question metadata, and other readable block metadata.
- URL/storage/path-only values are excluded from AI context.
- HTML/script/style markup is cleaned before readability checks.
- Lesson Builder now saves the current block state and reloads the complete lesson before generating AI questions.
- Module-level AI quiz generation uses the same context extractor for consistency.
- Reduced the minimum readable context threshold to 80 cleaned characters while keeping the safeguard against empty lessons.

## Validation note
The source archive does not include root `node_modules`; local `npm run typecheck` therefore reports missing `vite/client` and `node` typings until dependencies are restored with `npm ci`. No Cloud Functions changes are required by this hotfix.
