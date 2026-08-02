# Medical Elites LMS v1.0.0-rc.1 — Production Readiness Guide

## Backend runtime

Firebase Functions now targets Node.js 22 in both `functions/package.json` and `firebase.json`.

Updated backend dependencies:

- `firebase-functions` `^7.2.5`
- `firebase-admin` `^14.1.0`
- `openai` `^6.46.0`

The OpenAI SDK remains lazily imported inside the callable function to keep Firebase function discovery fast.

## Local verification

Use Node 22 for Firebase Functions:

```powershell
nvm install 22
nvm use 22
cd functions
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force lib -ErrorAction SilentlyContinue
npm install --registry=https://registry.npmjs.org/
npm run build
cd ..
```

Verify the frontend:

```powershell
npm install
npm run lint
npm run typecheck
npm run build
```

## Deploy backend

```powershell
firebase use medical-elites-lms
firebase functions:secrets:access OPENAI_API_KEY
$env:FUNCTIONS_DISCOVERY_TIMEOUT="60"
firebase deploy --only functions:medicalElitesAi
Remove-Item Env:FUNCTIONS_DISCOVERY_TIMEOUT
```

## Deploy data rules and hosting

```powershell
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only hosting
```

## Production smoke test

1. Public home page and legal pages.
2. Student, tutor, administrator and founder login.
3. Curriculum Designer.
4. AI Curriculum Import reports `Analysis method: AI`.
5. Lesson package and PDF preview.
6. Assessment attempt, marking, release and gradebook.
7. Attendance, timetable, finance, messages and notifications.
8. Medi AI.
9. Logout and direct-route refreshes.
10. Mobile sidebar and PWA/offline banner.

## Release gate

Tag `v1.0.0` only after all smoke tests pass on the deployed URL.
