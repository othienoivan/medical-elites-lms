# Medical Elites Homepage & Public Experience Refresh

## Included
- Fixes faint/unreadable mobile text in the dark platform ecosystem section.
- Refreshes the homepage messaging to reflect the current Medical Elites platform: academic learning, assessments, Medi AI, knowledge support, marketplace/storefronts, Flutterwave payments, wallets, student library, clinical education, institutional operations, communication, analytics, and security.
- Updates the public footer and removes the obsolete RC1 version label.
- Uses `admin@medicalelites.org` for platform contact/support references.
- Keeps `Made with ❤️ from Othieno Ivan.` globally visible across all routed pages through `CreatorAttribution`.
- Improves Featured Course Unit cards with a reliable local image fallback and public tutor/module/lesson/rating/student metadata.
- Extends the Create Course Unit page with public catalogue fields for tutor name, module count, lesson count, rating, learner count, and image URL.
- Adds registered-user testimonial submission with pending moderation.
- Public homepage/testimonials show only approved Firestore testimonials (with existing static testimonials as fallback until approvals exist).
- Adds Firestore security rules for testimonial submission/moderation.

## Test note
The dedicated homepage regression tests pass in the provided project snapshot. The uploaded snapshot did not include `functions/src/index.ts`, so the complete historical test suite cannot run in this environment. Run the full release gates in your local complete repository.

## Validate locally
```powershell
npm run typecheck
npm test
npm run release:check
```

## Deploy
Testimonials require the new Firestore rules, so deploy both rules and hosting:
```powershell
firebase deploy --only firestore:rules,hosting
```
