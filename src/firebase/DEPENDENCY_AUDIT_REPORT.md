# Dependency Security Review — Alpha 7

Audit command:

```powershell
npm audit
```

## Current result

- Critical: 0
- High: 1
- Moderate: 3
- Low: 0

## Findings

### `xlsx` — high severity

The installed npm release is affected by published prototype-pollution and regular-expression denial-of-service advisories. npm does not currently offer an automatic fix for the installed package line.

**Current exposure:** The application uses `xlsx` for client-side spreadsheet export. The risk is materially higher when parsing untrusted spreadsheets than when creating exports from application-owned data.

**Interim controls:**

- Do not use `xlsx` to parse arbitrary user-uploaded spreadsheets.
- Keep spreadsheet imports disabled unless strict server-side validation is introduced.
- Continue using it only for exports generated from trusted application data during this release cycle.
- Evaluate migration to a maintained spreadsheet library before commercial deployment.

### `pptx-preview`, `echarts`, and `uuid` — moderate severity

The PowerPoint preview dependency introduces vulnerable transitive versions of ECharts and UUID. npm proposes changing `pptx-preview`, but the suggested action may be disruptive and does not guarantee compatibility with the current lesson viewer.

**Interim controls:**

- The standardized PDF-preview workflow remains the preferred browser-viewing method.
- Retain original PowerPoint downloads.
- Avoid passing untrusted presentation content directly to the legacy renderer.
- Plan removal of `pptx-preview` after existing Office lessons have PDF previews.

## Decision

Do not run:

```powershell
npm audit fix --force
```

A forced upgrade may introduce breaking dependency changes. The current findings are documented and should be handled through controlled dependency replacement during stabilization.
