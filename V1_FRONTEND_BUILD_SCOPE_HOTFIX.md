# V1 Frontend Build Scope Hotfix

## Problem
The root React build compiled an obsolete nested Firebase Functions source directory under `src/firebase/ai_timeout_patch/functions/src`. The root frontend package does not install `firebase-admin`, `firebase-functions`, or `openai`, so TypeScript failed before Vite could build.

## Resolution
Updated `tsconfig.app.json` to exclude:

- `src/firebase/ai_timeout_patch/**`
- `src/**/functions/**`
- frontend test files

Cloud Functions remain separate from the React frontend TypeScript project and must be installed/built from their own `functions` package when needed.

## Validation
A copy of the obsolete folder was deliberately restored under `src/firebase/ai_timeout_patch`, then `npm run build` completed successfully.
