# v3.2.1 Course Detail & Rating Accuracy

- Course detail metrics now fall back to the enriched public catalogue counts when client-side legacy content queries cannot resolve the canonical relationship.
- Public catalogue ratings now rebuild from published verified productReviews, so older marketplace products with stale or missing ratingAverage/ratingCount fields still show real learner ratings.
- Existing product aggregate counters remain a fallback.
- Adds regression coverage for course detail counts and review-derived ratings.

Suggested Git tag: v3.2.1
