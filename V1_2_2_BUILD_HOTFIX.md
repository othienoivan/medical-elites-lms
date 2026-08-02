# Medical Elites LMS v1.2.2 Build Hotfix

Corrected malformed multiline string delimiters in both copies of `CreateQuizPage.tsx`.

The AI quiz context is now assembled using explicit newline escape sequences:

- lesson block text: `join("\\n")`
- lesson sections: template string with `\\n`
- multiple lessons: `join("\\n\\n")`

Automated test result: 29/29 passed.

Local deployment sequence:

```powershell
npm run build
firebase deploy --only functions:createDonationCheckout,functions:medicalElitesAi,firestore:rules,hosting
```
