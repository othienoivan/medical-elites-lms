# Medical Elites Platform v3.0.0 RC3 — Platform Layer

## Purpose
RC3 introduces the operational SaaS console around the stable LMS. It does not replace `institutionId` in academic queries and does not migrate students, lessons, modules, quizzes, assessments or messaging.

## Included
- Domain-driven `platform` bounded context.
- Platform access gate with bootstrap super-admin email configuration.
- Platform dashboard.
- Tenant and independent tutor managers.
- Plan builder and configurable commissions.
- Feature flags.
- License and activation manager.
- Platform audit centre.
- Support centre.
- Platform announcements.
- AI and storage usage dashboard.
- Branding engine.
- Product roadmap.
- Platform settings.
- Explicit Firestore rules for all RC3 collections.

## Security note
RC3 permits existing administrator accounts without a `platformRole` to bootstrap the platform console. Before onboarding institution administrators, set the platform owner's user document to `platformRole: "super_admin"` and update the rules to require that value exclusively.

## Collections
`tenants`, `plans`, `featureFlags`, `auditLogs`, `supportTickets`, `platformAnnouncements`, `platformUsage`, `roadmapItems`, `roadmapVotes`, `licenseGrants`, and `platformSettings`.

## Deployment
1. Preserve `.env.local`.
2. Add `VITE_PLATFORM_SUPER_ADMIN_EMAILS`.
3. Run `npm run release:check`.
4. Deploy `firestore:rules,firestore:indexes,hosting`.

## Rollback
Redeploy the prior stable rollback package. RC3 creates only additive platform collections; removing the RC3 frontend and rule blocks does not alter academic records.
