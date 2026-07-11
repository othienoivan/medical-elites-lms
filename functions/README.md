# Medical Elites Firebase Functions

This folder contains the secure backend for the AI Academic Assistant.

## Required runtime

Use Node.js 20 for local installation and testing. Firebase deploys this folder with the `nodejs20` runtime configured in the root `firebase.json`.

## Clean installation on Windows PowerShell

From the project root:

```powershell
cd functions
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Force package-lock.json -ErrorAction SilentlyContinue
npm config set registry https://registry.npmjs.org/
npm config delete proxy
npm config delete https-proxy
npm cache clean --force
npm install --registry=https://registry.npmjs.org/
npm run build
cd ..
```

The first successful installation creates a fresh `package-lock.json` containing public npm registry URLs.

## Secret and deployment

```powershell
firebase functions:secrets:set OPENAI_API_KEY
firebase deploy --only functions:medicalElitesAi
```

The secret already exists if Firebase reports that a secret version was previously created.
