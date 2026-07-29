# Dependency Security Review — Alpha 2

The previous local audit reported 3 moderate and 1 high vulnerability.

## Policy
- Do not run `npm audit fix --force` without reviewing breaking changes.
- Run `npm audit` locally and identify the exact dependency chain.
- Prefer targeted upgrades with regression testing.
- Keep `package-lock.json` committed.
- Review install-script approvals before enabling them.

## Known heavy dependencies
- `pptx-preview` remains isolated to document preview workflows.
- `xlsx`, `jspdf`, and `html2canvas` should remain route-lazy-loaded.
