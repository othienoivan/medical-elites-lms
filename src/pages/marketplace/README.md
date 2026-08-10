# Medical Elites v3.2 — Student Library Regression-Test Patch

This hotfix updates the brittle roadmap regression test so it verifies that
`MarketplaceCommerceService.listPurchases(...)` is called without requiring a
specific local variable name such as `currentUser` or `authenticatedUser`.

## Apply

1. Extract this ZIP into the project root.
2. From PowerShell in the project root, run:

```powershell
.\patch-v311-test.ps1
```

3. Validate:

```powershell
npm run typecheck
npm test
npm run release:check
```

The production `StudentLearningLibraryPage.tsx` remains unchanged.
