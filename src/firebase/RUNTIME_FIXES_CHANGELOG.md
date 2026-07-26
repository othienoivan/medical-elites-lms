# Runtime Fixes

This patch addresses four reported runtime issues:

1. Quiz attempts could save successfully but still show a failure alert when draft cleanup or fullscreen exit failed.
2. Ordinary YouTube watch/share URLs were sent directly to an iframe instead of being converted to embed URLs.
3. PowerPoint files were shown only as download links; they are now embedded through the Microsoft Office web viewer while retaining the download link.
4. Student registration could fail because Firestore rejects `undefined` values, especially an empty optional `authUid`.

Verified with:

- `npm run lint`
- `npm run build`
