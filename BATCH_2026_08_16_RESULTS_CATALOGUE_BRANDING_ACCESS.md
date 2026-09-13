# Medical Elites LMS — Coordinated Batch (16 Aug 2026)

## Included

- Result-release notifications are created once, on the first release transition, and link students directly to the released assessment review.
- Released assessment review displays per-question tutor feedback wherever feedback exists, plus overall tutor remarks.
- Public/Home catalogue now requires all of: published course unit, at least one active module, at least one active lesson, and a genuine thumbnail image. Placeholder-only course units are excluded.
- AI marketplace review now includes thumbnail presence in deterministic eligibility. AI auto-approval remains optional and manual review remains available.
- Branding Engine expanded for logo, favicon, social/SEO image, default course image, site name, tagline, SEO title/description and brand colours.
- Runtime tenant site identity effect applies configured title, meta description, favicon and brand CSS variables for active tenant workspaces.
- Added navigation for authenticated standalone pages, with role-aware Dashboard/Profile routes plus Courses, Notifications and Home.
- Admin route compatibility expanded so admin accounts can traverse dashboard links that reuse tutor-facing pages.
- Platform frontend/backend role mismatch corrected: backend platform access now recognizes the same platform administrator role set used by the platform gate.

## Important deployment note

The uploaded archive contains incomplete dependency directories. Frontend TypeScript validation could not start because `vite/client` and Node typings were absent. The Functions TypeScript compiler also reported missing ambient type packages from the bundled dependency tree, although it emitted the updated `functions/lib/index.js`. Run `npm ci` at project root and in `functions/` in a normal connected development environment, then run `npm run typecheck`, `npm run build`, and `cd functions && npm run build` before production deployment.
