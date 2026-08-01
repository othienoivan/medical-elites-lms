# Source Tree Policy

## Authoritative application source

`src/` is the only production application source tree compiled by TypeScript and Vite.

## Legacy mirror

`src/firebase/src/` is a historical mirror retained temporarily because several regression tests and migration references still inspect it. It is excluded from `tsconfig.app.json` and must not be imported by production code.

Rules for RC1:

1. New application code must be added only under `src/`.
2. Production imports must never reference `src/firebase/src/`.
3. Security-rule mirrors under `src/firebase/` must remain byte-for-byte synchronized with root deployable rules.
4. The legacy mirror will be removed only after its tests are migrated to the authoritative source tree.
