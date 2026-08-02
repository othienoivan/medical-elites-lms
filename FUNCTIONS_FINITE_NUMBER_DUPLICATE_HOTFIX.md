# Functions finiteNumber duplicate hotfix

This patch resolves the TypeScript error:

- TS2393 Duplicate function implementation

The Phase 3 validated numeric helper was renamed from `finiteNumber` to `validatedFiniteNumber` and all subscription-related calls were updated. The original quiz/module helper remains unchanged.

## Apply
Extract this ZIP into the project root and allow replacement of:

- `functions/src/index.ts`

## Verify

```powershell
cd functions
npm install
npm run build
cd ..
```

Then deploy the Phase 3 functions and related resources.
