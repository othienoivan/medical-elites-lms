# v3.1 Commerce Engine Consolidation

This batch consolidates tutor products, cart, wishlist, editing, checkout and owner permissions around `marketplaceProducts`.

## Key fixes
- Cart and wishlist reads/deletes no longer reference `request.resource`, fixing buyer permission errors.
- Product records are normalized when read, preserving compatibility with legacy seller and price fields.
- Manage now opens a protected tutor edit route.
- Product owners can update an unchanged published status or move products back to draft/submitted.
- Checkout logs Flutterwave rejection details and returns a safe actionable error instead of an opaque HTTP 500.
- Root and mirrored Firestore rules remain synchronized.
