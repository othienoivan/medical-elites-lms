# v1.2.1 RC1 Deployment

1. Ensure `.env.local` contains all six `VITE_FIREBASE_*` values.
2. Run `npm ci`.
3. Run `npm run release:check`.
4. Deploy hosting with `firebase deploy --only hosting`.
5. Open the production URL in an incognito window.
6. Verify homepage navigation on desktop and mobile.
7. Verify login for student, tutor, and administrator accounts.
8. Verify course units, module lesson counts, lesson download, and donations.

Do not delete `src/firebase/src` in this release. It is still referenced by a regression test and should only be removed as a dedicated package migration.
