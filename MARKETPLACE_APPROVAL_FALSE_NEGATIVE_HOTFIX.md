# Marketplace Approval False-Negative Hotfix — 2026-08-16

## Fixed
- Removed the circular rule that required a course unit to already be published before it could pass marketplace approval readiness.
- Manual `Approve & Publish` now performs a fresh server-side readiness check instead of trusting an old AI-review snapshot.
- Readiness resolves legacy/current course aliases, active modules, active lessons and thumbnail URL/path fields.
- Readiness diagnostics now state exactly which requirement is missing.
- `Approve & Publish` now publishes both the marketplace product and the linked course unit.
- AI remains advisory only; human approval is still mandatory.

## Validation
- `functions/npm run build`: PASS
- `node --check functions/lib/index.js`: PASS
- Root frontend typecheck was not required for this Functions-only hotfix and the extracted workspace lacks root Vite/Node typings.
