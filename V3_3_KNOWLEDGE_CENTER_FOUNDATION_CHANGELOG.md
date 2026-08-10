# Medical Elites LMS v3.3 — Knowledge Center Foundation

## Added
- Protected, lazy-loaded Knowledge Center routes under `/help`.
- Role-aware static documentation repository for students, tutors and administrators.
- Search across titles, summaries, keywords and article content.
- Category pages, FAQ, troubleshooting and version-aware release notes.
- Context-aware article resolution based on the current application route.
- Shared header Help action.
- Initial documentation for stabilized learning, assessment, marketplace, payment and administration workflows.
- Regression tests for routes, domain services, content and navigation.

## Architecture
The first release uses source-controlled static documentation. It requires no Firestore migration and preserves the v3.2 security and runtime baseline. Future phases can add Firestore-backed authoring, feedback analytics, guided walkthroughs and Medi AI documentation mode.
