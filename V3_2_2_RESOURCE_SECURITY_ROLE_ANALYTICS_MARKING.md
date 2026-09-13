# v3.2.2 Resource Security, Role Isolation, Assessment Analytics & Marking

## Fixes
- HTML5 converted lessons use a trusted callable to obtain a fresh short-lived Cloud Storage signed URL rather than relying on a persisted Firebase download token.
- PDF and PowerPoint downloads no longer fetch the cross-origin Firebase download URL into JavaScript; the download action obtains a trusted short-lived attachment URL when a storage file path is available and otherwise navigates directly.
- Added an explicit Cloud Storage CORS configuration and PowerShell helper for Medical Elites web origins.
- `/tutor` is now tutor-only; `/admin` remains admin-only.
- Direct tutor registration is explicitly marked as an independent workspace and bootstraps `tutor_{uid}` rather than inheriting an institution tenant.
- Tutor assessment analytics now loads the quiz, attempts and question snapshots through a trusted tutor-owned callable, fixing legacy Firestore permission failures.
- Manual marking now displays the actual question text, options and expected answer instead of only the Question ID.
- Tutor assessment marking/attempt workspace callables require the tutor role.

## Deployment
1. `npm run typecheck`
2. `npm test`
3. `npm run release:check`
4. `cd functions; npm install; npm run build; cd ..`
5. `./scripts/configure-storage-cors.ps1`
6. `./scripts/configure-lesson-resource-access.ps1`
7. Deploy the changed functions and hosting.

## Regression
Packaging environment: 243/243 Node regression tests passed. Full TypeScript validation must still be run locally because the packaged project intentionally excludes node_modules.
