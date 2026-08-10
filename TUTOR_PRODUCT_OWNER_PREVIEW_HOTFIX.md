# Tutor Product Owner Preview Hotfix

Fixes draft/submitted tutor products showing "Product unavailable" when the owning tutor opens View/Manage.

## Behavior
- Published products remain publicly visible.
- Draft/submitted/review products remain hidden from other users.
- The owning tutor can preview any of their own products.
- Purchase, cart, wishlist, reviews, and marketplace analytics are disabled for unpublished owner previews.
- A tutor-preview banner and return link to My Products are shown.

## Deploy
```powershell
npm run typecheck
npm run release:check
firebase deploy --only hosting
```
