import type { MarketplaceProduct } from "../domain/models";
import { MarketplaceRepository } from "../infrastructure/marketplace-repository";

export function normalizeMarketplaceSlug(value: string): string { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
export function marketplaceSku(type: string): string { return `ME-${type.toUpperCase().replaceAll("_", "-")}-${Date.now().toString(36).toUpperCase()}`; }
export function filterMarketplaceProducts(products: MarketplaceProduct[], term: string, categoryId: string, type: string): MarketplaceProduct[] {
  const needle = term.trim().toLowerCase();
  return products.filter((product) => (!needle || [product.title, product.shortDescription, product.sellerName, ...product.tags].join(" ").toLowerCase().includes(needle)) && (!categoryId || product.categoryId === categoryId) && (!type || product.type === type));
}
export const MarketplaceService = { ...MarketplaceRepository };
