# V1 Backend Modernization Changelog

Version: `1.0.0-rc.1`

- Migrated Firebase Functions runtime from Node.js 20 to Node.js 22.
- Updated `firebase-functions` to `^7.2.5`.
- Updated `firebase-admin` to `^14.1.0`.
- Updated `openai` to `^6.46.0`.
- Preserved lazy OpenAI import to avoid deployment discovery timeouts.
- Retained `OPENAI_API_KEY` as a Firebase Secret.
- Added production deployment and smoke-test documentation.

No Firestore data model changes are included in this batch.
