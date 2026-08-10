# v3.2.0 Tenant, Catalogue, Enrollment & Lesson Notification Recovery

- Firestore tenant/subscription authorization accepts trusted current tenant identity as a compatibility path when old membership document IDs are non-canonical.
- Tutor Enrollment Manager now loads course units through a trusted server catalogue, avoiding client tenant/legacy query failures.
- Public course catalogue uses a new V2 callable that scans bounded source collections once and resolves canonical plus legacy academic links in memory.
- Course cards and student course-unit cards receive live module, lesson, learner, tutor, duration and rating metadata from the V2 catalogue.
- Added Firestore update trigger that creates idempotent academic notifications for active learners when a lesson transitions to published.
- Firestore rules must be deployed with this release.
