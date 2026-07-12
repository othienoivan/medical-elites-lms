# Medical Elites LMS v1.0.0 RC1 Changelog

## Security hardening

- Replaced the permissive Firestore fallback rule with a deny-by-default rule.
- Added explicit access rules for programmes, course units, modules, lessons, questions, quizzes, and examinations.
- Corrected quiz draft rules so reads and deletes no longer depend on `request.resource`.
- Expanded quiz-attempt ownership checks to include `studentId`, `studentAuthUid`, and legacy `userId`.
- Prevented conversation participants from changing membership or ownership fields during message updates.
- Restricted direct-message edits to the recipient's `readByUids` field.
- Added creator attribution to notifications and restricted notification creation.
- Removed the unused Firestore helper that generated deployment warnings.

## Release engineering

- Updated the application version to `1.0.0-rc.1`.
- Added a `typecheck` npm script.
- Added RC1 security, testing, and known-issues documentation.

## Verification

- `npm run lint`: passed.
- `npm run build`: passed.
- Production bundle generated successfully.
