# Marketplace Thumbnail Approval Hotfix — 2026-08-16

## Fixed
- Approval readiness no longer stops at the first non-empty thumbnail field.
- A legacy placeholder course image can no longer mask a valid uploaded marketplace/product thumbnail.
- The validator now checks all supported course and product image fields independently and accepts the first genuine non-placeholder image.
- Object-style image metadata with `downloadUrl`, `downloadURL`, `url`, `imageUrl`, `thumbnailUrl`, `path`, or `filePath` is also supported.
- The minimum publication rule remains unchanged: at least one active module, one active lesson, and one genuine thumbnail image.

## Validation
- `functions`: `npm run build` passed.
- Generated `functions/lib/index.js`: `node --check` passed.
