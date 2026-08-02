# RC5 Batch 1 Marketplace Architecture

## Scope

This release adds a marketplace bounded context without replacing any academic LMS collection or route. It introduces a public published catalogue, tutor/institution seller records, product creation, platform moderation, and entitlement contracts.

## Product lifecycle

`draft -> submitted -> review -> published -> hidden -> archived`

Sellers may create and edit only their own `draft` or `submitted` products. Only a platform administrator can publish, hide, or archive a product.

## Product ownership

A product has a `sellerId`, `sellerType`, and optional `institutionId`. The model supports independent tutors, institutions, and official Medical Elites content.

## Entitlements

Purchases in Batch 2 will issue `productEntitlements`. Supported access models are lifetime, fixed-term, subscription, institution licence, and promotional access. Entitlements are server-written and buyer-readable.

## Collections

- `marketplaceProducts`
- `marketplaceCategories`
- `sellerProfiles`
- `productMedia`
- `productTags`
- `productEntitlements`

## Integration boundaries

- Commerce handles checkout and payment verification.
- Finance handles journals, wallets, and revenue allocation.
- Learning will consume entitlements for enrollment and content access.
- Platform handles moderation and governance.
- Batch 2 adds carts, orders, purchases, and wishlists.
