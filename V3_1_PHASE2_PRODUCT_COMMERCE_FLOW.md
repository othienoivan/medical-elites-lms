# v3.1 Phase 2 — Tutor Product Commerce Flow

- Added direct Buy Now checkout for published tutor products.
- Corrected backend product resolution to use marketplaceProducts with legacy fallback.
- Added seller metadata to single-product commerce orders for fulfillment and tutor visibility.
- Added student marketplace and purchases route aliases.
- Added tutor Sales & Orders page.
- Extended Firestore Rules and indexes for tutor-owned commerce orders.
- Existing payment verification remains idempotent and grants product entitlements/course access once.
