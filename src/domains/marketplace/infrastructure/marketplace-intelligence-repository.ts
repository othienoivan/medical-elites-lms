import { collection, doc, getDoc, getDocs, limit, orderBy, query, setDoc, serverTimestamp, where } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { db, functions } from "../../../config/firebase";
import type { MarketplaceProduct } from "../domain/models";
import type { MarketplaceCoupon, MarketplacePromotion, ProductRatingSummary, ProductReview, SellerAnalyticsSnapshot } from "../domain/intelligence";

function mapDoc<T>(snapshot: { id: string; data(): unknown }): T {
  return { id: snapshot.id, ...(snapshot.data() as object) } as T;
}

export const MarketplaceIntelligenceRepository = {
  async listReviews(productId: string, max = 40): Promise<ProductReview[]> {
    const snap = await getDocs(query(collection(db, "productReviews"), where("productId", "==", productId), where("status", "==", "published"), orderBy("createdAt", "desc"), limit(max)));
    return snap.docs.map((item) => mapDoc<ProductReview>(item));
  },
  async getRatingSummary(productId: string): Promise<ProductRatingSummary | null> {
    const snap = await getDoc(doc(db, "productRatingSummaries", productId));
    return snap.exists() ? mapDoc<ProductRatingSummary>(snap) : null;
  },
  async recordView(customerUid: string | null, productId: string): Promise<void> {
    if (!customerUid) return;
    await setDoc(doc(db, "recentlyViewed", `${customerUid}_${productId}`), { customerUid, productId, viewedAt: serverTimestamp() }, { merge: true });
  },
  async listRecommendations(product: MarketplaceProduct, max = 8): Promise<MarketplaceProduct[]> {
    const sameCategory = await getDocs(query(collection(db, "marketplaceProducts"), where("status", "==", "published"), where("categoryId", "==", product.categoryId), orderBy("salesCount", "desc"), limit(max + 1)));
    return sameCategory.docs.map((item) => mapDoc<MarketplaceProduct>(item)).filter((item) => item.id !== product.id).slice(0, max);
  },
  async listTrending(max = 12): Promise<MarketplaceProduct[]> {
    const snap = await getDocs(query(collection(db, "marketplaceProducts"), where("status", "==", "published"), orderBy("salesCount", "desc"), limit(max)));
    return snap.docs.map((item) => mapDoc<MarketplaceProduct>(item));
  },
  async getSellerAnalytics(sellerId: string): Promise<SellerAnalyticsSnapshot[]> {
    const snap = await getDocs(query(collection(db, "sellerAnalytics"), where("sellerId", "==", sellerId), orderBy("period", "desc"), limit(12)));
    return snap.docs.map((item) => mapDoc<SellerAnalyticsSnapshot>(item));
  },
  async listPromotions(): Promise<MarketplacePromotion[]> {
    const snap = await getDocs(query(collection(db, "marketplacePromotions"), orderBy("createdAt", "desc"), limit(100)));
    return snap.docs.map((item) => mapDoc<MarketplacePromotion>(item));
  },
  async listCoupons(): Promise<MarketplaceCoupon[]> {
    const snap = await getDocs(query(collection(db, "marketplaceCoupons"), orderBy("createdAt", "desc"), limit(100)));
    return snap.docs.map((item) => mapDoc<MarketplaceCoupon>(item));
  },
  submitReview: httpsCallable(functions, "submitMarketplaceReview"),
  voteReview: httpsCallable(functions, "voteMarketplaceReview"),
  moderateReview: httpsCallable(functions, "moderateMarketplaceReview"),
  upsertPromotion: httpsCallable(functions, "upsertMarketplacePromotion"),
  upsertCoupon: httpsCallable(functions, "upsertMarketplaceCoupon"),
  reviewSellerVerification: httpsCallable(functions, "reviewMarketplaceSellerVerification"),
};
