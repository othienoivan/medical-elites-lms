# Medical Elites Platform domain-driven architecture

## Decision

All new Platform v3 code is organised into bounded contexts. The current LMS is not moved wholesale. Migration is incremental and protected by regression tests.

## Bounded contexts

- **Identity:** users, memberships, roles and permissions.
- **Platform:** tenants, workspaces, feature flags and entitlements.
- **Billing:** plans, subscriptions, invoices, payments, commissions and wallets.
- **Marketplace:** listings, moderation, purchases, access grants and reviews.
- **AI:** gateway requests, prompt versions, model routing, quotas and usage metering.
- **Support:** tickets, knowledge base, platform notices and service operations.
- **Learning:** course units, modules, lessons, enrolments and progress. Initially legacy-backed.
- **Assessment:** question bank, quizzes, examinations and attempts. Added when migrated.

## Layer rules

1. Domain code is framework-independent.
2. Application code orchestrates use cases and depends on domain contracts.
3. Infrastructure adapters implement repositories and provider integrations.
4. Presentation code calls application services and does not query Firebase directly.
5. Cross-domain imports use each domain's public `index.ts` only.
6. Existing LMS services remain operational until explicitly migrated.

## Migration sequence

1. Add domain contracts and boundary validation without runtime changes.
2. Build new RC3 Platform Console features only inside `src/domains/platform`.
3. Add Firebase adapters under each domain's `infrastructure` folder.
4. Introduce application services and tests.
5. Route new UI through application services.
6. Migrate legacy contexts one workflow at a time, keeping compatibility adapters.

## Four-release programme

- **RC3 — Platform Layer:** tenant manager, plan manager, feature flags, audit and support foundations.
- **RC4 — Commerce Layer:** subscriptions, checkout, revenue sharing, wallets and payouts.
- **RC5 — Marketplace:** tutor storefronts, course/resource sales, moderation, ratings and access grants.
- **v3.0 Final:** onboarding, white-label branding, production analytics, documentation and LTS hardening.
