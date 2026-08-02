# Project Florence — Storage Production Hardening

## Scope

This release replaces broad legacy upload paths with authenticated, owner-aware storage namespaces.

## New paths

- Tenant users: `tenants/{tenantId}/uploads/{uploaderUid}/{folder}/{fileName}`
- Independent tutors: `users/{uid}/uploads/{folder}/{fileName}`
- Profile images: `users/{uid}/profile/{fileName}`

## Security controls

- All reads require authentication.
- Tenant resources are readable only by users belonging to the same tenant.
- New lesson/resource uploads require Tutor or Admin role.
- Upload metadata records uploader UID, tenant ID, original filename and upload category.
- Updates and deletions validate ownership; administrators retain controlled recovery access.
- File sizes and MIME types are validated in both the browser and Storage Rules.
- Legacy root folders remain authenticated read-only for compatibility; new writes are denied.
- All unspecified paths are denied.

## Deployment

```powershell
npm install
npm run release:check
firebase deploy --only storage
```

Test image, PDF, PowerPoint, audio and video upload/download with a Tutor account, then confirm a Student cannot upload lesson resources.
