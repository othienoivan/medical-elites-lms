# RC5 Final — Index and Public Course Catalogue Hotfix

## Changes

- Updated the public index page to present Medical Elites as a complete health sciences education platform.
- Added Marketplace navigation and calls to action.
- Added a platform ecosystem section covering Learning, Assessments, AI, Marketplace, Finance, ERP, Communication, Analytics and Security.
- Replaced the public course-unit catalogue's user-scoped query with a dedicated public published-course query.
- Added public Firestore read access only for records with `published == true`.
- Updated the course detail page and homepage featured section to use the public catalogue.
- Added search, loading skeletons and clearer empty/error states to `/courses`.
- Added safe display defaults for legacy course-unit documents that lack optional card fields.
- Featured course units fall back to the first four published units when no unit is explicitly featured.

## Deployment

Run:

```powershell
npm install
npm run release:check
firebase deploy --only firestore:rules,hosting
```

## Smoke tests

1. Open `/` while signed out and verify Marketplace and Course Units links.
2. Open `/courses` while signed out and confirm all documents with `published: true` appear.
3. Search by title, programme and code.
4. Open a public course-unit detail page.
5. Confirm unpublished course units remain inaccessible to the public.
