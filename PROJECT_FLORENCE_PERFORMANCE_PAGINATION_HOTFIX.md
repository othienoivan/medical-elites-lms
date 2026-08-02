# Project Florence — Performance and Pagination Hotfix

## Scope
- Added cursor pagination to the tutor assessment submission inbox.
- Limited each Firestore attempt read to 50 records, with a maximum page size of 100.
- Added an explicit Load more submissions action and loading/error states.
- Added lazy image and YouTube iframe loading in lesson delivery.

## Operational impact
Large institutions no longer download the complete `quizAttempts` collection whenever the submission inbox opens. This reduces Firestore reads, initial render work, memory consumption, and mobile data usage.

## Deployment
Run `npm run release:check`, then deploy Hosting. No rules or data migration are required.
