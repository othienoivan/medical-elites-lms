import { BarChart3, Eye, ShoppingBag, WalletCards } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MarketplaceIntelligenceService, MarketplaceService, type MarketplaceProduct, type SellerAnalyticsSnapshot } from "../../domains/marketplace";
import useAuth from "../../hooks/useAuth";

export default function MarketplaceSellerAnalyticsPage() {
  const { currentUser } = useAuth();
  const [snapshots, setSnapshots] = useState<SellerAnalyticsSnapshot[]>([]);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  useEffect(() => { if (!currentUser) return; void Promise.all([MarketplaceIntelligenceService.getSellerAnalytics(currentUser.uid), MarketplaceService.listSellerProducts(currentUser.uid, true)]).then(([a, p]) => { setSnapshots(a); setProducts(p); }); }, [currentUser]);
  const totals = useMemo(() => snapshots.reduce((acc, row) => ({ views: acc.views + row.views, orders: acc.orders + row.orders, revenue: acc.revenue + row.revenue, refunds: acc.refunds + row.refunds }), { views: 0, orders: 0, revenue: 0, refunds: 0 }), [snapshots]);
  const cards = [["Product views", totals.views, Eye], ["Orders", totals.orders, ShoppingBag], ["Revenue", `UGX ${totals.revenue.toLocaleString()}`, WalletCards], ["Products", products.length, BarChart3]] as const;
  return <main className="min-h-screen bg-slate-50 p-4 sm:p-8"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-bold uppercase text-cyan-700">Seller Centre</p><h1 className="text-3xl font-black">Marketplace analytics</h1></div><Link to="/marketplace/sell" className="rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white">Manage products</Link></div><div className="mt-7 grid gap-4 md:grid-cols-4">{cards.map(([label,value,Icon])=><div key={label} className="rounded-2xl border bg-white p-5"><Icon className="text-cyan-700"/><p className="mt-4 text-sm text-slate-500">{label}</p><p className="text-2xl font-black">{value}</p></div>)}</div><div className="mt-7 rounded-2xl border bg-white p-6"><h2 className="text-xl font-black">Product performance</h2><div className="mt-4 divide-y">{products.length===0?<p className="py-6 text-slate-600">No products yet.</p>:products.sort((a,b)=>b.salesCount-a.salesCount).map(product=><div key={product.id} className="flex items-center justify-between gap-4 py-4"><div><p className="font-bold">{product.title}</p><p className="text-sm text-slate-500">{product.status} · {product.ratingAverage.toFixed(1)} rating</p></div><p className="font-black">{product.salesCount} sale(s)</p></div>)}</div></div></div></main>;
}
