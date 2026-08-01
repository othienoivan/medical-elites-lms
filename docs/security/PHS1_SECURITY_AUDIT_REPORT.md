# Medical Elites Platform — PHS-1 Security Audit Report

## Scope

Reviewed the deployed RC4 baseline: Firebase Authentication integration, Firestore rules, Storage rules, Hosting headers, AI callable function, donation checkout, Flutterwave webhook, secret handling, platform-console authorization, and server-controlled finance collections.

## Remediated findings

### Critical — implicit Platform Console authorization

`isPlatformAdmin()` previously treated every institution administrator without a `platformRole` field as a platform administrator. This could expose tenants, plans, feature flags, licenses, platform settings, finance dashboards, and support operations to ordinary institution administrators.

**Fix:** Platform access now requires `role: "admin"` plus an explicit `platformRole` of `super_admin`, `platform_support`, or `platform_finance`.

**Deployment prerequisite:** Ensure the founder profile at `users/{uid}` contains:

```json
{
  "role": "admin",
  "platformRole": "super_admin",
  "isActive": true
}
```

Set this using the Firebase Console or a trusted Admin SDK process before deploying the hardened Firestore rules.

### High — tutor AI modes accessible to students

Only curriculum import previously enforced tutor/admin authorization. A student could request tutor question generation, lesson generation, marking guides, or performance analysis.

**Fix:** Every AI mode now has an explicit role allow-list.

### High — unmetered AI and checkout calls

Authenticated users could repeatedly call AI and donation-checkout functions, increasing API cost and creating excessive pending checkout records.

**Fix:** Server-side fixed-window rate limits are enforced through server-maintained `functionRateLimits` records. Browser access to these records is denied.

### High — Platform-role fallback in Firestore rules

Resolved with explicit platform-role checks. The permissive missing-field fallback was removed.

### Medium — webhook replay/idempotency coverage

Donation status checks existed, but provider transaction receipts were not independently tracked.

**Fix:** Added server-maintained `webhookReceipts` keyed by Flutterwave transaction ID, timing-safe verification for both supported signature headers, and mandatory transaction IDs.

### Medium — internal AI error disclosure

Raw provider error messages could be returned to the client.

**Fix:** Detailed failures remain in server logs; clients receive a generic error.

### Medium — tenant Storage path accepted any MIME type

Tenant and user-owned uploads were size-limited but not consistently content-type limited.

**Fix:** Tenant paths now accept only validated images, supported documents, video, or audio. User paths accept validated images/documents.

### Medium — missing baseline browser security headers

**Fix:** Added `nosniff`, strict referrer handling, frame protection, and a restricted permissions policy.

### Low — duplicate Firestore match for `auditLogs`

Overlapping rules made authorization harder to review.

**Fix:** Consolidated academic and platform audit-log permissions into one explicit match block.

## Accepted risks / deferred work

1. **Firebase App Check is not yet enforced** for callable functions. Enforcing it before the web client is registered and tested would break AI and checkout calls. Configure App Check in staging, verify valid tokens, then set `enforceAppCheck: true` in a later batch.
2. Rate-limit documents require a Firestore TTL policy on `expiresAt` to control storage growth.
3. Malware scanning is not implemented. Add an object-finalize scanning pipeline before allowing broad public marketplace uploads.
4. Existing institution-scoped academic records remain on the legacy authorization model. Cross-tenant emulator tests remain required before migrating those collections.
5. Content Security Policy was not added because the current Firebase, Flutterwave, PDF, and rich-editor asset requirements need staging validation first.

## Security posture after remediation

- Platform privilege escalation: remediated.
- Client writes to finance ledgers/payments/wallets: denied.
- Storage default: deny.
- Webhook verification: HMAC/legacy verification plus independent provider verification and receipt idempotency.
- Secrets: Firebase Secret Manager references; secret files excluded from Git.
- AI authorization and abuse protection: role-gated and rate-limited.
