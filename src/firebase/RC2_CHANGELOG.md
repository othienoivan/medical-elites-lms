# Medical Elites LMS v1.0 RC2

## User experience
- Added a global toast notification system.
- Existing `window.alert()` calls are now presented as non-blocking, accessible toast messages without requiring risky edits across more than one hundred call sites.
- Added automatic success, warning, error and information styling.
- Added dismiss controls, timed expiry and an ARIA live region.
- Replaced the route spinner with a full-page skeleton loader.

## Performance
- Added explicit vendor chunking for Firebase, React, PDF tools, Excel tools, TipTap and PowerPoint preview.
- Kept PowerPoint parsing behind its existing dynamic import.
- Raised the warning threshold only after separating heavyweight third-party libraries into independently cached chunks.

## Reliability
- Preserved RC1 hardened Firestore rules and messaging permissions hotfix.
- Updated application version to `1.0.0-rc.2`.
