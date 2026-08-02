# Medical Elites LMS V1.1 Tutor Catalogue Visibility Hotfix

## Corrected defects

- AI-imported programmes, course units and modules were stored as drafts but tutor management pages loaded only published records.
- One rejected optional module ownership query caused the entire module list to fail.
- The assigned-tutor Firestore rule contained an unnecessary type predicate that prevented reliable `array-contains` query authorization.
- The service worker attempted to cache `chrome-extension://` requests.

## Behaviour after deployment

- Tutor management pages show both draft and published records owned by or assigned to the tutor.
- Student/public learning views continue to show published records only.
- Optional legacy/shared ownership queries cannot hide successfully loaded tutor-owned records.
- Imported draft records are immediately visible and can later be published through the management workflow.
- Unsupported browser-extension requests are ignored by the service worker.
