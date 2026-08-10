# Medical Elites v3.1.3 Next Release Batch

Implemented in this batch:
- Purchased course/course-unit library items now open the canonical `/courses/:slug` route instead of the nonexistent `/student/course-units/:id` route.
- Student self-profile updates are limited to an explicit editable-field allowlist, avoiding failures caused by legacy user records that do not contain every immutable identity field.
- Added HTML5/CSS lesson block with pasted HTML and `.html/.htm` upload support; student rendering is isolated in a sandboxed iframe.
- Removed the legacy `MediFloatingAssistant` from role layouts; the global Medi Platform Copilot launcher in `HeaderActions` remains.
- Improved Platform Plans capacity editing with `-1 = Unlimited` guidance and unambiguous storage handling.
- Added baseline Medical Elites title, canonical URL, Open Graph metadata, robots.txt and sitemap.xml.
- Added regression tests for the above.

## PowerPoint -> HTML5 high-fidelity conversion
A faithful conversion of PowerPoint animations, transitions, SmartArt, triggers, hyperlinks and embedded multimedia cannot be guaranteed by the current browser-only PPTX handling. This batch adds the HTML5 lesson destination needed for converted packages, but deliberately does NOT pretend to provide high-fidelity PPTX conversion.

The next converter phase should use a dedicated server-side conversion adapter/service and store the resulting HTML5 package/assets in Firebase Storage. The lesson block can then point at the generated HTML entry point. The adapter must expose conversion status and fidelity warnings when unsupported PowerPoint constructs are encountered.

## Recommended data-driven plan catalogue
Create these through Platform > Subscription Plans so Firestore `plans` remains authoritative. These are commercial starting points, not runtime constants.

Tutor Starter: 100 students, 10 course units, 10 GB, 250 AI credits; core authoring + question bank + marketplace.
Tutor Professional: 1,000 students, 40 course units, 40 GB, 1,000 AI credits; add AI lesson/question generation, professional exam builder, analytics, certificates.
Tutor Executive: 100,000 students, 100 course units, 100 GB, 1,000+ AI credits; full tutor entitlements including white label/ERP as configured.

Institution Starter: 500 students, 25 tutors, 50 course units, 100 GB, 2,000 AI credits.
Institution Professional: 5,000 students, 150 tutors, 250 course units, 500 GB, 10,000 AI credits; advanced analytics, ERP, certificates, marketplace.
Institution Enterprise: use -1 (Unlimited) or negotiated limits for students/tutors/course units/storage/AI; full entitlements, white label and enterprise controls.

Pricing should be set by the platform owner in UGX/USD after validating willingness-to-pay, payment fees, AI/storage cost and support load. No pricing is hard-coded by this batch.
