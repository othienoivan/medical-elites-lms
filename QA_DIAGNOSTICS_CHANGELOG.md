# QA & Diagnostics Centre — Alpha 4

## Added

- Founder-only `/founder/diagnostics` route.
- Live Authentication, Firestore, Storage configuration, network, service-worker and Medi checks.
- Institution-readiness indicators from existing platform metrics.
- Browser-side error capture for uncaught errors and rejected promises.
- Local error-log viewer and clear action.
- Exportable JSON platform health report.
- Release-certification checklist and build information.
- Founder Dashboard link to the Diagnostics Centre.

## Security

Founder access still requires the `admin` role and the email configured by `VITE_FOUNDER_EMAIL`.
The diagnostics page does not grant additional Firestore permissions.

## Version

`1.1.0-alpha.4`
