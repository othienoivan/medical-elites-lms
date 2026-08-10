# v3.1.7 PowerPoint → HTML Lesson Builder

The HTML/CSS block in the tutor Lesson Builder now supports two authoring paths:

1. Existing HTML/CSS — paste or upload an `.html/.htm` file.
2. Convert PowerPoint to HTML — upload `.pptx` and choose:
   - **HTML Package**: separate optimized slide images plus an HTML presentation viewer.
   - **Self-contained HTML5**: one portable HTML document with embedded slide images.

## Conversion architecture

The existing Medical Elites Office Converter Cloud Run service is extended to:
- accept tenant/user-namespaced PowerPoint uploads;
- convert PPTX → PDF with LibreOffice;
- render PDF pages to optimized JPEG slides with Poppler;
- generate responsive HTML presentation controls;
- write the converted HTML into the uploader's `html5` storage namespace.

The original `.pptx` remains stored and can be reused.

## Deployment

The Cloud Run converter must be redeployed because it now requires `poppler-utils` and contains the HTML conversion engine:

```powershell
.\scripts\deploy-office-converter.ps1
```

Then validate the application:

```powershell
npm run typecheck
npm test
npm run release:check
```

Deploy the web application after validation:

```powershell
firebase deploy --only storage,hosting
```

No new Firebase Function is required for this workflow. Conversion is triggered by the existing Storage → Eventarc → Cloud Run pipeline.

## Tutor workflow

Dashboard → Lessons → Builder → Add Block → HTML5 / CSS → Convert PowerPoint to HTML → choose format → upload `.pptx` → wait for conversion → preview → save lesson.
