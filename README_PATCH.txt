Medical Elites LMS - v3.1.3 Marketplace/Profile/HTML5 Hotfix Batch

Fixes:
1. Purchased course products: creates trusted marketplaceCourseAccess grants derived only from verified active purchases. Existing purchases are reconciled when My Library loads; future purchases create grants during fulfilment.
2. Student profile: uses trusted updateOwnStudentProfile callable and updates canonical or legacy student records linked to the authenticated account.
3. Pasted HTML5/CSS: normalizes lesson blocks to Firestore-safe plain values before update, while preserving HTML/CSS content strings.

Files are laid out relative to the project root. Copy/overwrite them into the project.

Validation already run in the patch workspace:
- npm test: 213 passed, 0 failed.
- Full npm ci/typecheck/build could not be executed in the patch environment because its internal npm mirror returned 404 for existing dependencies. Run these locally.

LOCAL VALIDATION:
npm run typecheck
npm test
npm run build
cd functions
npm run build
cd ..

DEPLOY (functions are REQUIRED for this hotfix):
firebase deploy --only functions,firestore:rules,hosting

After deploy, sign out/in or hard refresh, then open Student > My Library once. That invokes the trusted reconciliation for purchases made before this patch.
