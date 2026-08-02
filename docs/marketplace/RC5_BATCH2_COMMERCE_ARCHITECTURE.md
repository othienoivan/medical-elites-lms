# RC5 Batch 2 Marketplace Commerce Architecture

## Purchase flow
Cart → trusted checkout callable → Flutterwave hosted payment → signed webhook → independent transaction verification → invoice and receipt → entitlements → purchase records → academic enrolment → cart cleared.

## Ownership and security
Carts and wishlists use deterministic documents keyed by the authenticated user ID. Orders, purchases, enrolments and entitlements are written only by trusted Cloud Functions. Users may read only their own records; sellers may read purchases linked to their seller ID; platform administrators retain operational visibility.

## Automatic enrolment
For `course`, `course_unit`, and `bundle` products, `linkedResourceIds` are merged into the learner's `assignedCourseUnitIds` and `enrolledCourses`. This maintains compatibility with the existing stable LMS allocation model.

## Idempotency
Checkout commands use `financeCommands`. Webhooks use `webhookReceipts`. Entitlement IDs are deterministic by learner and product, preventing duplicate access grants.
