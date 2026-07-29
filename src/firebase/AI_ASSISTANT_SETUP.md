# Medical Elites AI Academic Assistant setup

The browser never receives the OpenAI API key. Requests are sent to an authenticated Firebase callable function.

## 1. Install function dependencies

```powershell
cd functions
npm install --registry=https://registry.npmjs.org/
npm run build
cd ..
```

## 2. Store the API key securely

```powershell
firebase functions:secrets:set OPENAI_API_KEY
```

Paste the OpenAI API key when prompted. Do not place it in `.env.local` or commit it to Git.

## 3. Deploy

Firebase Cloud Functions generally requires the Firebase project to use the Blaze billing plan.

```powershell
firebase deploy --only functions:medicalElitesAi
firebase deploy --only firestore:rules
```

## 4. Test

- Student: `/ai-assistant`
- Tutor: `/tutor/ai-assistant`

Every output must be reviewed before clinical use or publication.
