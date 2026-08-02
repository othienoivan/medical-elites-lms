# ADR-001: Adopt domain-driven modular architecture

- Status: Accepted
- Date: 2026-07-31

## Context

Medical Elites has grown from an LMS into a platform covering learning, assessment, ERP, AI, billing and marketplace capabilities. Technical-folder organisation alone creates coupling and makes future SaaS work risky.

## Decision

New v3 functionality will be organised by bounded context with domain, application, infrastructure and presentation layers. Existing LMS code will remain stable and migrate incrementally.

## Consequences

- New business concepts gain explicit ownership and contracts.
- Firebase is kept outside domain logic.
- Mobile/API reuse becomes possible.
- Initial duplication through adapters is accepted to avoid disruptive rewrites.
- Boundary validation becomes part of the release quality gate.
