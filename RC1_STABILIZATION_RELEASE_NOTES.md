# Medical Elites LMS — RC1 Stabilization Release

## Release designation
Version **1.0.0-rc.3**

## Purpose
This release establishes repeatable quality gates before production deployment. It does not introduce a new business module; it reduces regression, configuration drift, and deployment risk.

## Delivered controls
- Canonical deployable Firestore rules at `firestore.rules`.
- Mirrored rule/index files validated against the canonical deployment copies.
- Corrected Notification Centre rule drift in the deployable root rules.
- Notification recipients may update only read, pin, and archive state.
- Notification content and ownership fields are immutable to recipients.
- User deletion of notification documents is disabled.
- Notification preference documents are owner-scoped and schema constrained.
- Environment configuration template and validation.
- Automated RC smoke tests.
- One-command release quality gate.
- GitHub Actions quality-gate workflow.

## Required commands
```powershell
npm install
npm run release:check
firebase deploy --only firestore:rules,firestore:indexes,hosting
```

## Deployment rule
Do not deploy when `npm run release:check` fails. Correct the reported issue and rerun the full command.
