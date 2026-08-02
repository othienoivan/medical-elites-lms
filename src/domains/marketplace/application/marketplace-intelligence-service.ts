import type { MarketplaceProduct } from "../domain/models";
import { MarketplaceIntelligenceRepository } from "../infrastructure/marketplace-intelligence-repository";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}

export const MarketplaceIntelligenceService = {
  listReviews: MarketplaceIntelligenceRepository.listReviews,
  getRatingSummary: MarketplaceIntelligenceRepository.getRatingSummary,
  recordView: MarketplaceIntelligenceRepository.recordView,
  listRecommendations: MarketplaceIntelligenceRepository.listRecommendations,
  listTrending: MarketplaceIntelligenceRepository.listTrending,
  getSellerAnalytics: MarketplaceIntelligenceRepository.getSellerAnalytics,
  listPromotions: MarketplaceIntelligenceRepository.listPromotions,
  listCoupons: MarketplaceIntelligenceRepository.listCoupons,
  async submitReview(input: { productId: string; purchaseId: string; rating: number; title: string; body: string; difficulty: number; valueForMoney: number; wouldRecommend: boolean }): Promise<string> {
    const result = await MarketplaceIntelligenceRepository.submitReview(input);
    return String(asRecord(result.data).reviewId ?? "");
  },
  async voteReview(reviewId: string, helpful: boolean): Promise<void> {
    await MarketplaceIntelligenceRepository.voteReview({ reviewId, helpful });
  },
  async moderateReview(reviewId: string, status: "published" | "hidden"): Promise<void> {
    await MarketplaceIntelligenceRepository.moderateReview({ reviewId, status });
  },
  scoreProduct(product: MarketplaceProduct): number {
    return (product.salesCount * 2) + (product.ratingAverage * Math.max(1, product.ratingCount)) + (product.featured ? 25 : 0);
  },
};
