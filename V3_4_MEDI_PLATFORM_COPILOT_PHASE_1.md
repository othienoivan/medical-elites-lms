# Medical Elites LMS v3.4 — Medi Platform Copilot

## Implemented in this phase

- Floating Medi AI button across authenticated layouts through `HeaderActions`.
- Desktop side panel and mobile bottom sheet.
- Ask Medi, Explain This Page, Guide Me and Search Help entry modes.
- Deterministic answers for common platform questions before AI fallback.
- Correct purchased-course guidance to My Learning Library and My Purchases.
- Role-filtered internal navigation actions from the controlled route registry.
- Page-aware explanations for student, tutor, administrator and Knowledge Center routes.
- Session-persisted conversation history.
- Keyboard shortcut: Ctrl/Cmd + M.
- Suppression on login, registration, checkout, print and full-screen assessment routes.
- Read-only operation; no record-changing or destructive actions.

## Deployment

This phase changes the frontend only. Run the complete local release checks, then deploy hosting.

```powershell
npm run typecheck
npm test
npm run release:check
firebase deploy --only hosting
```

The existing `documentation_assistant` backend remains the AI fallback for questions not covered by deterministic platform knowledge.
