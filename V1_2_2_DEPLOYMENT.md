# v1.2.2 Deployment

Preserve `.env.local`, then run:

```powershell
npm ci
npm run build
firebase deploy --only functions:createDonationCheckout,functions:medicalElitesAi,firestore:rules,hosting
```

After deployment:
1. Complete a test donation and confirm return to `/dashboard?payment=complete`.
2. Open Student > My Profile and save a harmless profile edit.
3. Confirm course-unit and module lesson counts.
4. Reorder two lessons and reload the page.
5. Mark a module as requiring a quiz, create/publish its quiz, and test progression with a student account.
6. Test Generate Quiz with AI on a module containing sufficient lesson text.
