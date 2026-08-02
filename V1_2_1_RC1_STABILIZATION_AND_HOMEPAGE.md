# Medical Elites LMS v1.2.1 RC1

## Stabilization

- Preserved the working environment-based Firebase bootstrap.
- Confirmed the global application error boundary, offline banner, diagnostics listeners, route protection, and service-worker safeguards remain active.
- Audited the duplicate `src/firebase/src` tree. It is retained because the current regression suite explicitly validates mirrored registration-link behaviour from that tree. Removing it without a broader package migration would be unsafe.
- Updated the visible release label to v1.2.1 RC1.

## Homepage redesign

- Rebuilt the hero around the actual LMS value proposition.
- Added clear calls to create an account and explore course units.
- Added platform capability cards for learning, assessment, analytics, and clinical education.
- Replaced speculative learner/course totals with factual platform strengths.
- Implemented a functional, accessible mobile navigation menu.
- Improved responsive typography, spacing, contrast, and button behaviour.
- Corrected the main content landmark so the existing skip link works on the homepage.
- Removed the redundant second statistics block from the homepage flow.

## Verification

- 29/29 automated regression tests pass.
- TypeScript/build verification requires local dependencies. Run `npm ci` followed by `npm run release:check` before deployment.
