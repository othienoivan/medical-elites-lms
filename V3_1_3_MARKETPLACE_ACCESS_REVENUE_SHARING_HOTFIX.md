# Marketplace Learning Access + Automatic Revenue Sharing Hotfix

- Makes durable marketplace course ownership a first-class read authorization path independent of institutional role.
- Refreshes marketplace learning grants in the student access hook.
- Loads purchased course modules through a targeted course-unit query.
- Adds a complete Revenue Sharing configuration form and live UGX preview.
- Automatically allocates verified marketplace product revenue to platform, institution, and tutor wallets using Course → Tutor → Institution → Global rule precedence.
- Uses deterministic finance command/journal identifiers to prevent duplicate allocation on webhook/reconciliation retries.
- For independent tutors, any configured institution share is added to the tutor share.
