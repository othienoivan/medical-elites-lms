# RC2 UX Improvements

- Non-blocking toast feedback for legacy alert calls.
- Accessible status semantics and keyboard-dismissable notifications.
- Page skeletons during route downloads.
- Existing button-level loading and duplicate-click protection retained.

## Deliberately deferred
Synchronous `window.confirm()` calls remain in six destructive workflows. They will be replaced with an asynchronous confirmation-dialog API in RC3 to avoid changing deletion behavior during this release candidate.
