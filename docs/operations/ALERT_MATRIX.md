# Alert Matrix

| Signal | Threshold | Severity | Response |
|---|---:|---|---|
| Authentication failures | sustained spike over baseline | SEV-2 | inspect Auth and client release |
| Cloud Function errors | >5% for 5 minutes | SEV-2 | inspect logs and rollback |
| Payment verification failure | any repeated verified-payment failure | SEV-1 | freeze financial writes |
| Webhook replay/duplicate spike | >10 in 10 minutes | SEV-2 | review source and signatures |
| AI provider failure | >20% for 10 minutes | SEV-3 | activate fallback/support notice |
| Firestore permission regression | critical route affected | SEV-2 | compare rules and rollback |
| Storage upload failure | >10% for 10 minutes | SEV-3 | inspect rules/quota/provider |
