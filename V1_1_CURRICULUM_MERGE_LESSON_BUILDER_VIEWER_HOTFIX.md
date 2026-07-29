# Medical Elites LMS V1.1 — Curriculum Merge, Lesson Builder and PowerPoint Viewer Hotfix

## Corrected

- Course-unit merge and delete now use tutor/admin scoped linked-record queries compatible with hardened Firestore rules.
- The Visual Lesson Builder objective block accepts multiple objectives, one per line.
- Lesson objectives render as a numbered list in the lesson viewer.
- Preview Data now opens a visible modal containing the lesson payload instead of writing only to the browser console.
- PowerPoint and compatible Office resources can be viewed through the Microsoft Office browser viewer while retaining a separate original-file download button.

## Deployment

```powershell
npm install
npm run release:check
firebase deploy --only firestore:rules,firestore:indexes,hosting
```
