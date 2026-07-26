# Batch 8 — Launch Readiness and Reliability

## Added
- Global React error boundary with safe recovery actions.
- Catch-all 404 page and route.
- Firebase environment validation and `.env.example`.
- Shared Firebase error-to-user-message helper.
- Firebase Hosting SPA rewrites and cache headers.

## Updated
- Removed the development-only Firebase connection logging import.
- Moved Firebase settings from source code into Vite environment variables.
- Improved login error messages without exposing raw Firebase details.
- Wrapped the whole application in the global error boundary.

## Local setup
Copy `.env.example` to `.env.local` and fill in the Firebase web-app configuration values.

## Deployment
```powershell
npm run build
firebase deploy --only hosting
```

Deploy Firestore configuration separately when it changes:
```powershell
firebase deploy --only firestore
```
