# Checkout Account Status Compatibility Hotfix

Updates `financeProfile()` so commerce checkout blocks only profiles that are explicitly inactive.

Supported active legacy profiles may omit `isActive` or may use `status: "active"`.

The function still blocks profiles with:

- `isActive: false`
- `status` or `accountStatus` equal to `inactive`, `disabled`, `suspended`, `archived`, or `blocked`

Missing user profiles remain denied with a specific error.
