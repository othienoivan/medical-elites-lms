import type { MarketplaceMoney, MarketplaceProduct, MarketplaceProductStatus } from "./models";

export type CommerceAssetType = "course" | "document" | "question_bank" | "exam_package" | "video_course" | "live_class" | "bundle" | "membership";
export interface CommerceAsset {
  id: string; assetType: CommerceAssetType; sellerId: string; tenantId?: string; institutionId?: string;
  title: string; description: string; status: MarketplaceProductStatus; price: MarketplaceMoney;
  linkedProductIds: string[]; linkedCourseUnitId?: string; sourceProduct: MarketplaceProduct;
}
const typeMap: Partial<Record<MarketplaceProduct["type"], CommerceAssetType>> = {
  course: "course", document: "document", question_bank: "question_bank", exam_package: "exam_package",
  video_course: "video_course", live_class: "live_class", membership: "membership", bundle: "bundle",
  clinical_skills: "course", course_unit: "course", lesson: "course", mock_exam: "exam_package", pdf: "document", powerpoint: "document", video: "video_course",
};
export function marketplaceProductToCommerceAsset(product: MarketplaceProduct): CommerceAsset {
  return { id: product.id, assetType: typeMap[product.type] ?? "document", sellerId: product.sellerId,
    tenantId: product.tenantId, institutionId: product.institutionId, title: product.title,
    description: product.description, status: product.status, price: product.salePrice ?? product.price,
    linkedProductIds: product.type === "bundle" ? product.linkedResourceIds : [], linkedCourseUnitId: product.courseUnitId,
    sourceProduct: product };
}
