# v3.2.3 Institution Tutor Membership Separation
- `/admin/tutors` is tenant-membership scoped, not a global tutor list.
- Independent tutors with stale institution links are labelled clearly.
- Deactivate/Activate changes only institution membership, never the platform account.
- Remove from Institution preserves the account, courses, products, wallet, earnings and sales, creates/keeps `tutor_{uid}`, clears obsolete institution identity, and retains removed membership as an audit record.
