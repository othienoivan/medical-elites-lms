# QA & Diagnostics Test Checklist

- [ ] Founder can open `/founder/diagnostics`.
- [ ] Non-founder admin is redirected to Unauthorized.
- [ ] Student and tutor accounts cannot open the page.
- [ ] Core health checks complete without crashing.
- [ ] Firestore status is Healthy for the Founder account.
- [ ] Offline status changes when the browser disconnects.
- [ ] Service-worker status appears.
- [ ] Medi check returns Healthy when the deployed function is online.
- [ ] Institution-readiness counts match dashboard records.
- [ ] JSON health report downloads successfully.
- [ ] A browser error appears in the local error log.
- [ ] Clear Error Log removes locally retained entries.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
