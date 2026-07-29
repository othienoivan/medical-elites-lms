# RC3.2.1 AI Curriculum Backend Hotfix

## Cause

The curriculum importer used the general tutor lesson mode and silently fell back whenever the deployed callable rejected the mode, timed out, lacked the OpenAI secret, or returned non-JSON content. The project archive also did not contain the Firebase Functions source, making the deployed backend impossible to reproduce reliably.

## Resolution

- Added reproducible `functions/` source.
- Added dedicated `curriculum_import` mode.
- Added strict JSON Schema output.
- Increased callable timeout for large curriculum documents.
- Restricted curriculum analysis to tutors and administrators.
- Added explicit errors for missing/invalid API key, quota, authentication, and unsupported modes.
- Preserved heuristic fallback, but now displays the actual backend failure.

## Deployment

```powershell
cd functions
npm install --registry=https://registry.npmjs.org/
npm run build
cd ..

firebase functions:secrets:set OPENAI_API_KEY
firebase deploy --only functions:medicalElitesAi
```

Use Node.js 20 for the Functions package.
