# Medical Elites v3.1 — Tutor Commerce Centre

## Implemented

- Tutor-only Commerce Centre at `/tutor/commerce`.
- Tutor product directory at `/tutor/commerce/products`.
- Unified product builder at `/tutor/commerce/products/new`.
- Product types: course unit, digital course, document, question bank, examination package, clinical skills package, video course, live class, tutor membership and bundle.
- Products can link directly to tutor-owned course units for post-payment access grants.
- Tenant, institution and tutor ownership metadata are stored on every new product.
- Pricing, access duration, subscription-style access, visibility, reviews, certificates and download permissions are supported.
- Tutor sidebar now separates Commerce from institution communication and finance.

## Security boundary

Only the `tutor` role may access the Tutor Commerce routes. Platform subscription plans remain platform-managed and institution fee structures remain administrator-managed.
