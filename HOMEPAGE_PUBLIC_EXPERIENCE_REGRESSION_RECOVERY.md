# Homepage & Public Experience Regression Recovery

Restores the security and compatibility contracts expected by the current Medical Elites regression suite after the public homepage refresh.

- Restores non-circular `hasActiveTenantMembership()` tenant reads.
- Keeps full tenant-status validation in `hasTenantMembership()`.
- Restricts self profile writes with `affectedKeys().hasOnly(...)`.
- Restores durable `hasMarketplaceCourseAccess()` checks for purchased course units and linked module/lesson reads.
- Preserves testimonial moderation rules.
- Restores the homepage `Commerce & Finance` regression contract.
- Adds the missing public testimonials hook and legacy featured-course card type compatibility.
