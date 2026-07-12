# RC1 Known Issues

## Performance

- The PowerPoint preview library produces a bundle larger than 1 MB.
- The result-slip PDF bundle is larger than 500 kB.
- The shared Firebase/application bundle remains close to 900 kB.
- PowerPoint rendering may still fail or time out for large or privately hosted files; download remains available.

## Security and architecture

- Firebase App Check is not enforced for the AI callable function during local development.
- Client-side finance administration should eventually move to server-side callable functions.
- The `users` collection exposes complete profile documents to authenticated users to support messaging.

## Testing

- Automated Firestore Emulator rule tests are not yet included.
- End-to-end browser tests are not yet included.
- Cloud Functions dependency installation was not completed in the audit container, so the Functions build should be re-run locally before release.
