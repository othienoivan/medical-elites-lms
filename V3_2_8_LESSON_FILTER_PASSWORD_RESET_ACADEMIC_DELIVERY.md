# V3.2.8 Lesson Filter, Password Reset & Firebase-Only Academic Notifications

## Included

1. Tutor lesson list can be filtered/sorted by course unit.
2. Forgotten-password recovery uses Firebase Authentication `sendPasswordResetEmail()`.
3. Lesson, quiz/assessment, examination and assignment publication creates learner notifications in Firestore.
4. No Resend, SMTP, Africa's Talking or other external notification provider is required.

## Firebase-only scope

Firebase Authentication handles password-reset email. Firestore handles in-app academic notifications. Firebase does not provide a general-purpose outbound email or arbitrary SMS service for academic alerts, so those channels are intentionally excluded from this patch. Firebase Cloud Messaging can be added later for web/mobile push notifications without introducing a third-party delivery provider.

## Deployment

No external provider secrets are required. Build and validate, then deploy Functions and Hosting:

```powershell
npm run typecheck
cd functions
npm run build
cd ..
npm run release:check
firebase deploy --only functions,hosting
```
