import { useCallback, useEffect, useState } from "react";
import type { MarketplaceCategory, MarketplaceProduct } from "../domain/models";
import { MarketplaceService } from "../application/marketplace-service";
export function useMarketplace() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]); const [categories, setCategories] = useState<MarketplaceCategory[]>([]); const [loading, setLoading] = useState(true); const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => { setLoading(true); setError(null); try { const [items, cats] = await Promise.all([MarketplaceService.listPublished(), MarketplaceService.listCategories()]); setProducts(items); setCategories(cats); } catch (cause) { console.error(cause); setError("Marketplace products could not be loaded."); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]); return { products, categories, loading, error, refresh };
}
