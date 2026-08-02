# V1 Production Hardening and Security Audit

## Implemented

- Replaced the lesson loader's full-collection download with a Firestore query scoped by `moduleId` and `isPublished`.
- Added immutable application audit records for critical examination and clinical-logbook actions.
- Added strict Firestore validation for audit action names, actor identity and role, resource types, payload keys, institution scope, timestamps and text lengths.
- Preserved best-effort audit behaviour so a temporary audit-write failure cannot interrupt a tutor or student workflow.
- Kept audit records administrator-readable and permanently non-editable/non-deletable from the client.

## Deployment

Because Firestore rules changed, deploy both rules and hosting:

```bash
npm install
npm run build
firebase deploy --only firestore:rules,hosting
```

## Operational note

Audit logs are stored in `auditLogs`. For long-term retention, export this collection periodically to protected archival storage through a trusted backend or scheduled Cloud Function.
