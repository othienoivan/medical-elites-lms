# Document Delivery and Testing Access Hotfix

## Tutor registration
- Public tutor registration is enabled by default during testing.
- Set `VITE_ALLOW_PUBLIC_TUTOR_REGISTRATION=false` before commercialization.
- Administrator registration remains restricted.

## Document delivery
- Added a unified in-browser PDF document viewer.
- PDF lesson resources display directly in the browser.
- PowerPoint and Word blocks now require a PDF preview before lesson save/preview.
- The original Office file remains downloadable.
- Existing Office blocks should be edited once to upload a matching PDF preview.

## Why PDF previews
Browser PowerPoint and Word renderers are inconsistent, especially with large files, private Firebase URLs, fonts, animations, and advanced layouts. PDF provides a stable cross-browser presentation format while retaining the original source file.
