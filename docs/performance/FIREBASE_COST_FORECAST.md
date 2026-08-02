# Firebase Cost Forecast Method

Use measured reads, writes, function invocations, storage GB-month and egress from staging. Do not treat static estimates as invoices.

| Active students | Suggested planning reads/student/month | Writes/student/month | Operational note |
|---:|---:|---:|---|
| 100 | 1,500 | 150 | Free/low-cost pilot may be feasible depending on media and AI use. |
| 1,000 | 1,200 | 140 | Add aggregate dashboards and pagination. |
| 10,000 | 900 | 120 | Server-maintained counters, lifecycle policies and monitoring become mandatory. |
| 100,000 | 600 | 100 | Export analytics to a warehouse; avoid browser-wide collection scans. |

AI, video egress and payment-provider fees are likely to exceed Firestore cost and must be forecast separately.
