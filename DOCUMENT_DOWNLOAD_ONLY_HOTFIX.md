# Document Download-Only Hotfix

## Scope

PDF and PowerPoint resources are retained as uploadable and downloadable lesson attachments, but no longer have any in-browser preview workflow.

## Changes

- PDF lesson blocks render file name, file type, file size where available, and a Download button.
- PowerPoint `.ppt` and `.pptx` lesson blocks render file name, file type, file size where available, and a Download button.
- Removed PDF preview upload, replacement, opening and rendering controls from lesson authoring.
- Removed generated PDF preview handling from the Office document viewer.
- Existing stored `previewPdfUrl` metadata is ignored and does not render in the application.
- Standalone lesson resources remain download-only for PDF and PowerPoint.

## Preserved

- PDF and PowerPoint uploads.
- Original-file downloads.
- PDF parsing used by curriculum and question import tools. That parsing is an authoring/import utility, not a learner-facing document preview.
