# RC1 Security Audit

## Corrected in RC1

### Critical: permissive catch-all Firestore access

The previous rule allowed every authenticated user to read every unlisted collection and allowed tutors to write every unlisted collection. RC1 changes the fallback to deny all access unless a collection has an explicit rule.

### High: conversation document tampering

Conversation participants could previously alter participant lists and ownership metadata. RC1 permits participant updates only to message-summary fields.

### High: message mutation

Recipients could previously update arbitrary message fields. RC1 limits updates to `readByUids`.

### Medium: notification spoofing

Notification documents now include `createdByUid`. Rules require this field to equal the authenticated user and limit who may create cross-user notifications.

### Medium: quiz draft rule correctness

Read and delete operations no longer reference `request.resource`, which is unavailable for those operations.

## Accepted RC1 risks

- User documents remain readable to authenticated users because the messaging contact selector depends on them. A future release should introduce a restricted public profile collection.
- AI App Check remains disabled to preserve localhost development. Enable App Check before broad public deployment.
- Academic catalogue records are readable to all authenticated users. Student-facing filtering is currently enforced in application logic, not fully in Firestore rules.
- Finance writes are performed from the client by tutor/admin accounts. A future version should move payment posting and receipt sequencing to a trusted Cloud Function.

## Required deployment

Run:

```powershell
firebase deploy --only firestore:rules
```
