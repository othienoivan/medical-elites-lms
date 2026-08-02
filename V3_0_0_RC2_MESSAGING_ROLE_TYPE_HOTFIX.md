# Medical Elites Platform v3.0.0 RC2 Messaging Role Type Hotfix

## Corrected

- `MessagingContact.role` now uses the centralized `UserRole` type.
- `super_admin` is supported by the messaging data model.
- The legacy mirrored user model is aligned with the production role union.
- Messaging contact loading recognizes active super administrators.
- Staff contact filtering recognizes super administrators.
- Both `src/` and the temporary `src/firebase/src/` mirror were updated consistently.

## Reported TypeScript error resolved

`TS2322: UserRole is not assignable to "student" | "tutor" | "admin"`

## Verification

Run:

```powershell
npm run release:check
```
