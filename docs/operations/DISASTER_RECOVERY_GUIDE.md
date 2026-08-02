# Disaster Recovery Guide

## Recovery order
1. Authentication and platform access.
2. Firestore rules and critical academic data.
3. Cloud Functions and payment/AI integrations.
4. Storage resources.
5. Hosting frontend.
6. Messaging, analytics and non-critical dashboards.

## Restore verification
- Founder can access `/platform`.
- Ordinary admins cannot access Platform Console.
- Tutor sees students, course units, modules, lessons, assessments and messages.
- Student sees assigned learning content, quizzes and progress.
- Storage upload/download succeeds under expected roles.
- AI and payment endpoints reject unauthenticated or invalid requests.
