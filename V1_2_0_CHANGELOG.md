# Medical Elites LMS v1.2.0 consolidated upgrade

## Added
- Donate entry on student, tutor and administrator sidebars.
- Flutterwave checkout creation through a protected Cloud Function.
- UGX Mobile Money and card donation choices.
- One-time and monthly card donation modes.
- Verified, idempotent Flutterwave webhook processing.
- Expanded rich-text toolbar with headings, underline, links, nested lists, quotes, code and formatting controls.

## Changed
- PowerPoint files are upload/download only; in-browser PowerPoint preview is disabled.
- Module editing returns to the module list for the originating course unit.
- Module cards calculate their lesson counts from actual lesson records.
- Student lesson reads support current and legacy publication fields and module-based authorization.

## Deployment
1. `npm install`
2. `cd functions && npm install && npm run build && cd ..`
3. Configure secrets: `FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_WEBHOOK_SECRET`, and `FLUTTERWAVE_MONTHLY_PLAN_ID`.
4. Set `APP_URL=https://medicalelites.org` for Functions.
5. `npm run release:check`
6. `firebase deploy --only functions,firestore:rules,hosting`
