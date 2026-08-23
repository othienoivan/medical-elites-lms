# Public Catalogue Approval Sync Hotfix — 16 Aug 2026

## Fixed
- Public `/courses` and homepage catalogue now use the same real-thumbnail resolver as marketplace approval.
- A legacy placeholder in `courses.image` no longer masks a valid thumbnail stored in another course or marketplace-product field.
- Public visibility now requires a linked marketplace product that is `published` and human-approved.
- Approved marketplace-product thumbnails may satisfy the course-unit thumbnail requirement when the course record still contains a legacy placeholder.
- `Approve & Publish` is idempotent for already-published products: re-approving revalidates readiness instead of returning a state-based 400 error.

## Validation
- `functions/npm run build`: PASS
- `node --check functions/lib/index.js`: PASS
- Root TypeScript validation could not run in this extracted archive because the bundled root dependency tree is missing `vite/client` and `node` type definitions. No frontend source files were changed by this hotfix.
