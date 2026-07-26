# RC2 Performance Report

## Changes
- Route-level lazy loading remains enabled for all application pages.
- Heavy third-party libraries are now assigned to stable, separately cached chunks.
- Page navigation now displays a content-shaped skeleton instead of a blocking spinner.

## Remaining known heavyweight dependency
`pptx-preview` remains the largest bundle. It is dynamically loaded only when a PowerPoint lesson is opened, so it does not block the initial application route.

## RC3 targets
- Image compression and responsive image delivery.
- Firestore pagination for large student, attempt and finance collections.
- Mobile navigation and PWA caching.
