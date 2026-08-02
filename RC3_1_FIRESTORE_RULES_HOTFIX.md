# RC3.1 Firestore Rules Hotfix

Removed an orphaned rule block left behind after the document conversion service cleanup.

The invalid block caused:

- Unexpected `{` at line 388
- Unexpected `}` at line 396

After replacing `firestore.rules`, deploy with:

```powershell
firebase deploy --only firestore:rules
```
