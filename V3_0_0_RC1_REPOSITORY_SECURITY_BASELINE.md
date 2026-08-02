# Medical Elites Platform v3.0.0 RC1
## Repository and Security Baseline

### Delivered

- Production Cloud Storage rules replacing Firebase Test Mode.
- Authenticated downloads and tutor/admin-only writes for current legacy upload paths.
- Tenant-isolated `/tenants/{tenantId}/...` storage namespace for v3 migrations.
- User-owned `/users/{uid}/...` namespace for profile images and private evidence.
- File-size and MIME-type validation.
- Default-deny fallback for all unspecified Storage paths.
- Storage rules wired into `firebase.json` and mirrored under `src/firebase/`.
- Firebase Auth, Firestore, Functions and Storage emulator configuration.
- Restored authoritative `functions/` source and package configuration.
- Git ignore policy for secrets, builds and emulator artifacts.
- Staging Firebase and environment templates.
- Source-tree authority policy for the historical `src/firebase/src/` mirror.
- Automated platform-baseline validation and regression tests.

### Compatibility note

The current browser upload service stores resources in flat legacy paths such as `images/`, `pdfs/`, `powerpoints/`, `documents/` and `lesson-resources/`. RC1 secures those paths without breaking existing uploads. New v3 functionality should write to `/tenants/{tenantId}/...`; migration of existing objects can occur in a later controlled release.

### Deployment

```powershell
npm install
npm run release:check

cd functions
npm install
npm run build
cd ..

firebase deploy --only storage,firestore:rules,firestore:indexes,functions,hosting
```

### Storage verification

Test with one student, one tutor and one administrator:

1. Signed-out upload and download are denied.
2. A student can download an authorized lesson resource.
3. A student cannot upload to a legacy teaching-resource path.
4. A tutor can upload and delete an allowed lesson resource.
5. Oversized or disallowed MIME types are rejected.
6. A user from one tenant cannot access `/tenants/{otherTenantId}/...`.

Use the Firebase Emulator Suite before production deployment for cross-tenant rule tests.
