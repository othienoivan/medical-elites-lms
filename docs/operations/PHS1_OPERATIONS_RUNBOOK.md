# Medical Elites Production Operations Runbook

## Daily checks
- Review Cloud Functions errors and latency.
- Review failed Flutterwave webhook receipts and duplicate/replay attempts.
- Review AI request failures, rate-limit events and unusual usage.
- Confirm authentication, messaging, lesson access and checkout smoke tests.

## Incident severity
- **SEV-1:** platform unavailable, cross-tenant/data exposure, payment corruption.
- **SEV-2:** major workflow unavailable with no acceptable workaround.
- **SEV-3:** degraded feature with workaround.
- **SEV-4:** cosmetic or low-impact defect.

## Initial response
1. Record incident start time and affected services.
2. Freeze deployments.
3. Identify the last known-good release.
4. Inspect Firebase Functions logs, Hosting release history and Firestore rule changes.
5. Roll back Hosting/Functions/rules when mitigation is safer than live repair.
6. Validate tutor and student critical journeys.

## Backup strategy
- Schedule managed Firestore exports daily to a restricted Cloud Storage backup bucket.
- Retain daily backups for 14 days, weekly backups for 12 weeks and monthly backups for 12 months.
- Use bucket versioning/lifecycle controls for Storage assets.
- Perform a quarterly restore drill into a non-production Firebase project.

## Recovery objectives
- Target RPO: 24 hours for general academic data; lower for finance once transactional commerce is enabled.
- Target RTO: 4 hours for SEV-1 restoration.
