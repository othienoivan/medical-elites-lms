# RC2 PowerPoint Processing Service

## Purpose

Large PowerPoint files are no longer parsed entirely in the student's browser. A Cloud Run service converts each uploaded `.pptx` once into optimized WebP slides, thumbnails, and a PDF fallback.

## Processing pipeline

1. Tutor uploads a `.pptx` under `powerpoints/` in Firebase Storage.
2. Eventarc sends the Storage finalized event to Cloud Run.
3. LibreOffice converts the presentation to PDF.
4. Poppler renders each page.
5. WebP creates full slides and lightweight thumbnails.
6. Assets are uploaded under `powerpoint-previews/{previewId}/`.
7. Firestore `powerpointPreviews/{previewId}` is updated to `ready`.
8. The student viewer receives the update in real time and displays slides individually.

## Deployment

Run from the project root:

```powershell
Set-ExecutionPolicy -Scope Process Bypass
.\scripts\deploy-powerpoint-processor.ps1
firebase deploy --only firestore:rules
```

The script requires the Google Cloud CLI and a billing-enabled Google Cloud project because Cloud Run and Eventarc are paid Google Cloud services with usage-based billing.

## Existing presentations

After deployment, process older `.pptx` files:

```powershell
.\scripts\backfill-powerpoints.ps1
```

## Security

- Cloud Run is not publicly invokable.
- Eventarc invokes it with a dedicated service account.
- Students can read preview status only when authenticated.
- Preview assets remain in Firebase Storage and continue to use Firebase Storage access controls.
- The original file downloads only after the user selects **Download Original**.

## Supported files

- `.pptx`: supported.
- Legacy `.ppt`: not processed automatically; save as `.pptx` first.
- Embedded videos, macros, unusual fonts, and advanced animations may be flattened or omitted during conversion.
