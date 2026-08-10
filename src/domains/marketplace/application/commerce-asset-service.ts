import { MarketplaceService } from "./marketplace-service";
import { marketplaceProductToCommerceAsset, type CommerceAsset } from "../domain/commerceAsset";
export const CommerceAssetService = {
  async get(assetId: string): Promise<CommerceAsset | null> { const product = await MarketplaceService.getProduct(assetId); return product ? marketplaceProductToCommerceAsset(product) : null; },
  async listPublished(max = 60): Promise<CommerceAsset[]> { return (await MarketplaceService.listPublished(max)).map(marketplaceProductToCommerceAsset); },
  async validateBundleOwnership(sellerId: string, productIds: string[]): Promise<void> {
    const uniqueIds = [...new Set(productIds.filter(Boolean))];
    if (uniqueIds.length < 2) throw new Error("A bundle must contain at least two unique products.");
    const products = await Promise.all(uniqueIds.map((id) => MarketplaceService.getProduct(id)));
    if (products.some((product) => !product)) throw new Error("One or more bundle products could not be found.");
    if (products.some((product) => product?.sellerId !== sellerId)) throw new Error("Bundles may contain only products owned by the same tutor.");
    if (products.some((product) => product?.status !== "published")) throw new Error("Only published products may be included in a bundle.");
  },
};
