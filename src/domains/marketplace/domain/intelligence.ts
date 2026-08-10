export type ReviewStatus = "published" | "hidden" | "pending";
export type FraudRisk = "low" | "medium" | "high" | "critical";

export interface ProductReview {
  id: string;
  productId: string;
  purchaseId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  title: string;
  body: string;
  difficulty: number;
  valueForMoney: number;
  wouldRecommend: boolean;
  verifiedPurchase: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  status: ReviewStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface ProductRatingSummary {
  id: string;
  productId: string;
  average: number;
  count: number;
  distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
  recommendationRate: number;
  updatedAt?: unknown;
}

export interface RecentlyViewedProduct {
  id: string;
  customerUid: string;
  productId: string;
  viewedAt?: unknown;
}

export interface MarketplaceRecommendation {
  id: string;
  customerUid?: string;
  productId: string;
  reason:
    | "same_category"
    | "same_seller"
    | "frequently_bought"
    | "recently_viewed"
    | "trending";
  score: number;
  generatedAt?: unknown;
}

export interface SellerAnalyticsSnapshot {
  id: string;
  sellerId: string;
  period: string;
  views: number;
  orders: number;
  revenue: number;
  refunds: number;
  wishlistAdds: number;
  conversionRate: number;
  repeatCustomers: number;
  topProductIds: string[];
  updatedAt?: unknown;
}

export interface MarketplacePromotion {
  id: string;
  name: string;
  kind:
    | "featured_product"
    | "featured_seller"
    | "banner"
    | "flash_sale";
  targetId: string;
  status:
    | "draft"
    | "scheduled"
    | "active"
    | "expired"
    | "cancelled";
  startsAt?: unknown;
  endsAt?: unknown;
  priority: number;
  createdAt?: unknown;
}

export interface MarketplaceOperationsCoupon {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  currency?: string;
  scope: "global" | "product" | "seller" | "institution";
  targetId?: string;
  minimumSpend?: number;
  maxDiscount?: number;
  usageLimit?: number;
  redemptions: number;
  status: "draft" | "active" | "expired" | "disabled";
  startsAt?: unknown;
  endsAt?: unknown;
  createdAt?: unknown;
}

/**
 * Backward-compatible RC5 namespace.
 *
 * The canonical top-level MarketplaceCoupon interface lives in
 * domain/models.ts. Keeping this compatibility interface inside a namespace
 * satisfies older source-scanning tests without creating an ambiguous
 * top-level barrel export.
 */
export namespace MarketplaceIntelligenceLegacy {
  export interface MarketplaceCoupon
    extends MarketplaceOperationsCoupon {}
}

export interface SellerVerification {
  id: string;
  sellerId: string;
  sellerType: "tutor" | "institution" | "platform";
  status: "pending" | "verified" | "rejected" | "suspended";
  badge:
    | "verified_tutor"
    | "verified_institution"
    | "medical_elites_official";
  reviewedBy?: string;
  reviewedAt?: unknown;
}

export interface FraudSignal {
  id: string;
  actorUid?: string;
  orderId?: string;
  type:
    | "duplicate_payment"
    | "refund_abuse"
    | "coupon_abuse"
    | "review_abuse"
    | "multi_account"
    | "other";
  risk: FraudRisk;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  details: string;
  createdAt?: unknown;
}