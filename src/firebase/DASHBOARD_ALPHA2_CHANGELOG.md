# Medical Elites Dashboard 2.0 — Alpha 2

## Added
- Administrator Dashboard using the shared MEX dashboard framework.
- Founder Command Centre protected by administrator role and founder email.
- Platform metrics service and reusable metrics hook.
- System health widget.
- Revenue, outstanding balance, AI usage, attendance and enquiry summaries.
- Admin and Founder routes.
- Administrator login now redirects to `/admin`.

## Security
Founder access requires both:
- Firestore role `admin`.
- Email matching `VITE_FOUNDER_EMAIL`.

The Founder page does not grant new server-side permissions; it only exposes data already available to administrators.
