# Medical Elites LMS v1.2.0-rc2.3

## PowerPoint server-rendering pipeline

- Added a Cloud Run container that converts `.pptx` files with LibreOffice.
- Added Eventarc deployment automation for Firebase Storage upload events.
- Added WebP full-slide and thumbnail generation.
- Added Firestore processing status records in `powerpointPreviews`.
- Replaced the large-file browser-first viewer with a real-time server-preview viewer.
- Added slide-by-slide lazy loading, keyboard navigation, thumbnails, fullscreen, and explicit original download.
- Added a backfill script for PowerPoint files uploaded before deployment.
- Preserved authenticated access and disabled client writes to preview status records.

## Version

`1.2.0-rc2.3`
