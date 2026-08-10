import { Eye, RefreshCw, ShoppingBag, Users, WalletCards } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { Link } from "react-router-dom";

import TutorLayout from "../../components/layout/TutorLayout";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import { functions } from "../../config/firebase";
import useAuth from "../../hooks/useAuth";

type ProductAnalytics = {
  id: string; title: string; status: string; sales: number; revenue: number; currency: string; customers: number; uniqueViewers: number; ratingAverage: number; ratingCount: number;
};
type AnalyticsResponse = {
  totals: { uniqueViewers: number; orders: number; customers: number; refunds: number; revenueByCurrency: Record<string, number> };
  products: ProductAnalytics[];
};

function money(amount: number, currency = "UGX") { return `${currency} ${Math.round(amount).toLocaleString()}`; }

export default function MarketplaceSellerAnalyticsPage() {
  const { currentUser } = useAuth();
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!currentUser?.uid) return;
    setLoading(true); setError("");
    try {
      const callable = httpsCallable<Record<string, never>, AnalyticsResponse>(functions, "getTutorMarketplaceAnalytics");
      const result = await callable({});
      setData(result.data);
    } catch (caught) {
      console.error("Failed to load tutor marketplace analytics:", caught);
      setError(caught instanceof Error ? caught.message : "Unable to load marketplace analytics.");
    } finally { setLoading(false); }
  }, [currentUser?.uid]);

  useEffect(() => { void load(); }, [load]);

  const primaryRevenue = useMemo(() => {
    const values = Object.entries(data?.totals.revenueByCurrency ?? {});
    if (values.length === 0) return "UGX 0";
    return values.map(([currency, value]) => money(value, currency)).join(" Â· ");
  }, [data]);

  const cards = [
    ["Unique product viewers", data?.totals.uniqueViewers ?? 0, Eye],
    ["Verified sales", data?.totals.orders ?? 0, ShoppingBag],
    ["Gross revenue", primaryRevenue, WalletCards],
    ["Customers", data?.totals.customers ?? 0, Users],
  ] as const;

  return (
    <TutorLayout title="Marketplace Analytics" subtitle="Live figures calculated from your verified marketplace purchases and product activity.">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-cyan-700">Seller Centre</p>
          <h2 className="text-3xl font-black text-slate-950">Marketplace performance</h2>
          <p className="mt-2 text-slate-600">Sales and revenue are derived from verified purchase records rather than cached product counters.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw size={17} /> Refresh</Button>
          <Link to="/tutor/commerce/products" className="rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white">Manage products</Link>
        </div>
      </div>

      {error && <Card className="mb-6 border border-red-200 bg-red-50 text-red-700">{error}</Card>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, Icon]) => <Card key={label}><Icon className="text-cyan-700"/><p className="mt-4 text-sm text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-slate-950">{loading ? "â€¦" : value}</p></Card>)}
      </div>

      <Card className="mt-7">
        <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-black">Product performance</h3><span className="text-sm text-slate-500">Refunded/revoked: {data?.totals.refunds ?? 0}</span></div>
        {loading ? <p className="py-6 text-slate-600">Loading product performanceâ€¦</p> : !data?.products.length ? <p className="py-6 text-slate-600">No products yet.</p> : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead><tr className="border-b bg-slate-50"><th className="p-3">Product</th><th className="p-3">Viewers</th><th className="p-3">Sales</th><th className="p-3">Customers</th><th className="p-3">Gross revenue</th><th className="p-3">Rating</th></tr></thead>
              <tbody>{[...data.products].sort((a,b)=>b.revenue-a.revenue).map((product)=><tr key={product.id} className="border-b"><td className="p-3"><p className="font-bold text-slate-950">{product.title}</p><p className="text-xs uppercase text-slate-500">{product.status}</p></td><td className="p-3">{product.uniqueViewers}</td><td className="p-3 font-bold">{product.sales}</td><td className="p-3">{product.customers}</td><td className="p-3 font-bold text-emerald-700">{money(product.revenue, product.currency)}</td><td className="p-3">{product.ratingAverage.toFixed(1)} ({product.ratingCount})</td></tr>)}</tbody>
            </table>
          </div>
        )}
      </Card>
    </TutorLayout>
  );
}

