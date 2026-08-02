# RC5 Final Marketplace Architecture

## Intelligence

Public product discovery uses published marketplace products, product rating summaries, seller profiles, recently viewed records and deterministic category-based recommendations. Reviews can only be created through a trusted callable function after verification against an active marketplace purchase.

## Operations

Platform administrators moderate reviews, manage promotions and coupons, review seller verification, and inspect fraud signals. Browser clients cannot directly mutate operational or aggregated marketplace records.

## Collections

- `productReviews`
- `productReviewVotes`
- `productRatingSummaries`
- `recentlyViewed`
- `recommendations`
- `trendingProducts`
- `sellerAnalytics`
- `buyerAnalytics`
- `marketplacePromotions`
- `marketplaceCoupons`
- `couponRedemptions`
- `sellerVerifications`
- `marketplaceModeration`
- `fraudSignals`
- `marketingCampaigns`
- `featuredContent`

## Security

Financial fulfilment, verified reviews, moderation, coupons, promotions and seller verification are server controlled. Learner and seller analytics remain scoped to their owners; global marketplace operations require Platform Console authorization.
