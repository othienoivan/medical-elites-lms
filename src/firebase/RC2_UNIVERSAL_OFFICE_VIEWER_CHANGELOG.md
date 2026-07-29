# RC2.4 Universal Office Viewer

## Changes
- Replaced the Cloud Run/LibreOffice PowerPoint processing pipeline with Microsoft Office Online embedded viewing.
- PowerPoint files no longer download automatically.
- Fullscreen, Open Viewer, Retry, and explicit Download Original controls are available.
- Firebase Storage paths are resolved to HTTPS download-token URLs before opening Office Viewer.
- Removed the PowerPoint Cloud Run container, deployment script, backfill script, preview subscription client, and unused `pptx-preview` dependency.
- Existing PDF and DOCX browser viewing remains available through the universal document viewer.

## Requirements
- The learner must be online.
- The PowerPoint URL must be reachable over HTTPS.
- Use `.pptx`; legacy `.ppt` files should be resaved as `.pptx`.

## Firebase
No Firestore rules or Cloud Functions deployment is required.
