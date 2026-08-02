# Dashboard Alpha 2 Test Checklist

- [ ] Student login redirects to `/dashboard`.
- [ ] Tutor login redirects to `/tutor`.
- [ ] Administrator login redirects to `/admin`.
- [ ] Non-admin users cannot access `/admin`.
- [ ] Only the configured founder admin can access `/founder`.
- [ ] Admin metrics load without Firestore permission errors.
- [ ] Revenue and outstanding balance match Finance records.
- [ ] Recent platform activity loads.
- [ ] Dashboard layouts work on mobile, tablet and desktop.
- [ ] `npm run lint` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
