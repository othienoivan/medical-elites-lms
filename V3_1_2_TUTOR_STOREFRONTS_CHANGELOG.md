# v3.1.2 Tutor Storefronts

- Added editable tutor storefront profile and branding settings.
- Added canonical shareable `/store/{slug}` URLs with UID fallback.
- Added slug-based public seller lookup.
- Added banner, headline, qualifications, specialties, languages, welcome message and teaching-experience fields.
- Added owner-only storefront management controls.
- Preserved public visibility to active seller profiles and published products only.
- Canonical production origin: `https://medicalelites.org`.

## Validation
Run `npm install`, `npm run typecheck`, `npm run release:check`, then deploy hosting and Firestore rules if changed separately.
