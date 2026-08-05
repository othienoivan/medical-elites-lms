export type MarketplaceCurrency = "UGX" | "USD" | "KES" | "TZS" | "RWF";
export type MarketplaceProductType = "course" | "course_unit" | "lesson" | "document" | "question_bank" | "exam_package" | "clinical_skills" | "video_course" | "live_class" | "membership" | "bundle" | "mock_exam" | "pdf" | "powerpoint" | "video";
export type MarketplaceProductStatus = "draft" | "submitted" | "review" | "published" | "hidden" | "archived";
export type MarketplaceSellerType = "tutor" | "institution" | "platform";
export type EntitlementAccessType = "lifetime" | "fixed_term" | "subscription" | "institution_license" | "promotional";

export interface MarketplaceMoney { amount: number; currency: MarketplaceCurrency; }
export interface MarketplaceProduct {
  id: string;
  sku: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  learningOutcomes: string[];
  type: MarketplaceProductType;
  status: MarketplaceProductStatus;
  price: MarketplaceMoney;
  categoryId: string;
  categoryName: string;
  tags: string[];
  sellerId: string;
  sellerName: string;
  sellerType: MarketplaceSellerType;
  tenantId?: string;
  institutionId?: string;
  programmeId?: string;
  programmeTitle?: string;
  academicYear?: string;
  semester?: string;
  yearOfStudy?: string;
  courseUnitId?: string;
  courseUnitTitle?: string;
  ownerTutorUid?: string;
  thumbnailUrl?: string;
  linkedResourceIds: string[];
  accessType: EntitlementAccessType;
  accessDays?: number;
  billingInterval?: "one_time" | "monthly" | "annual";
  visibility?: "public" | "institution_only" | "private_link";
  allowReviews?: boolean;
  certificateIncluded?: boolean;
  downloadAllowed?: boolean;
  salePrice?: MarketplaceMoney;
  saleStartsAt?: string;
  saleEndsAt?: string;
  ratingAverage: number;
  ratingCount: number;
  salesCount: number;
  featured: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
  publishedAt?: unknown;
}
export interface MarketplaceCategory { id: string; name: string; slug: string; description?: string; icon?: string; active: boolean; sortOrder: number; }
export interface SellerProfile { id: string; ownerUid: string; displayName: string; bio: string; institutionId?: string; institutionName?: string; photoUrl?: string; verified: boolean; status: "draft" | "active" | "suspended"; ratingAverage: number; ratingCount: number; followerCount: number; productCount: number; }
export interface ProductEntitlement { id: string; customerUid: string; productId: string; orderId?: string; accessType: EntitlementAccessType; startsAt: unknown; expiresAt?: unknown; status: "active" | "expired" | "revoked"; }

export type { MarketplaceCartItem, MarketplaceCart, MarketplaceWishlist, MarketplaceOrder, MarketplacePurchase, MarketplaceOrderStatus } from "./commerce";
