# PHS-1 Batch 2 Performance Audit

## Implemented
- Runtime Web Performance API monitoring for LCP, CLS and long tasks.
- TTL caching for Platform Console metrics and activity.
- Deterministic bundle analysis and performance-budget validation.
- Improved route/vendor chunk separation.
- Composite indexes for messaging, quiz attempts and audit chronology.
- Production cache headers remain immutable for hashed assets and no-cache for HTML.

## High-cost patterns still requiring staged migration
- Several legacy services perform full collection reads. They were documented rather than changed blindly because narrowing them without production-shaped data can hide records.
- Platform revenue totals currently require reading payment documents; introduce server-maintained aggregate snapshots before high transaction volume.
- Messaging contact discovery should move to institution-scoped, paginated directory queries.

## Performance budgets
See `performance-budget.json`. Budgets are warning-oriented until staging telemetry is available.
