# PHS-1 Permission Matrix

| Resource | Student | Tutor | Institution Admin | Platform Role | Trusted Server |
|---|---|---|---|---|---|
| Own user profile | Read/update safe fields | Read/update safe fields | Institution management | Platform operations | Full where required |
| Academic content | Assigned published content | Owned/assigned content | Same institution | No automatic academic access | Full where required |
| Messages | Participant only | Participant only | Participant only | No global message access | Maintenance only |
| Donations | Own records | Own records | Admin read | Platform operations | Create/verify/update |
| Platform collections | Denied | Denied | Denied unless explicit platform role | Read/manage by role | Full |
| Finance plans and ledgers | Denied | Denied | Denied | Read | Write only |
| Function rate limits | Denied | Denied | Denied | Denied | Read/write |
| Webhook receipts | Denied | Denied | Denied | Denied | Read/write |
| Tenant Storage | Assigned tenant read | Tenant write/read | Tenant write/read | Per tenant only | Full |
| User Storage | Own | Own; staff read where permitted | Staff read/delete where permitted | No global access | Full |
