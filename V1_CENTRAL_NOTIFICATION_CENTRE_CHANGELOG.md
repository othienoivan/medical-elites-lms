# V1 Central Notification Centre

## Delivered
- Central notification event schema with category and priority.
- Search, category filtering, active/archive views and pinned notices.
- Read, mark-all-read, archive/restore and pin/unpin actions.
- Per-user email, push and SMS preferences while preserving mandatory in-app delivery.
- Expanded academic, finance and system notification categories.
- Immutable notification content: recipients can only change personal state fields.
- Notification preference security rules scoped to the authenticated user.

## Integration note
Existing calls to `createNotification` remain compatible. New integrations can additionally pass `priority` and `eventKey`. Email, push and SMS preferences are stored now; actual external delivery requires a configured trusted backend/provider.
