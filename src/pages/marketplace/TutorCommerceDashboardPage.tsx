import { useEffect, useMemo, useState } from "react";
import { BarChart3, CircleDollarSign, PackageOpen, PlusCircle, ShoppingBag, Users } from "lucide-react";
import { Link } from "react-router-dom";
import TutorLayout from "../../components/layout/TutorLayout";
import useAuth from "../../hooks/useAuth";
import { MarketplaceService, type MarketplaceProduct } from "../../domains/marketplace";

export default function TutorCommerceDashboardPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;
    void MarketplaceService.listSellerProducts(currentUser.uid, true)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [currentUser]);

  const metrics = useMemo(() => {
    const published = products.filter((p) => p.status === "published").length;
    const drafts = products.filter((p) => p.status === "draft" || p.status === "submitted" || p.status === "review").length;
    const sales = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
    const revenue = products.reduce((sum, p) => sum + ((p.salesCount || 0) * (p.price?.amount || 0)), 0);
    return { published, drafts, sales, revenue };
  }, [products]);

  const cards = [
    ["Products", products.length, PackageOpen],
    ["Published", metrics.published, ShoppingBag],
    ["Drafts & review", metrics.drafts, BarChart3],
    ["Estimated gross sales", `UGX ${metrics.revenue.toLocaleString()}`, CircleDollarSign],
  ] as const;

  return (
    <TutorLayout title="Commerce Centre" subtitle="Manage products, sales and your tutor business.">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">Your marketplace business</h2>
            <p className="text-sm text-slate-600">Create products from your course units, documents, examinations, question banks and live classes.</p>
          </div>
          <Link to="/tutor/commerce/products/new" className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 font-bold text-white">
            <PlusCircle size={18} /> Create product
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <div key={label} className="rounded-2xl border bg-white p-5 shadow-sm">
              <Icon className="text-cyan-700" />
              <p className="mt-4 text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-black text-slate-950">{loading ? "…" : value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Link to="/tutor/commerce/products" className="rounded-2xl border bg-white p-5 hover:border-cyan-400"><PackageOpen className="text-cyan-700"/><h3 className="mt-3 font-black">My Products</h3><p className="text-sm text-slate-600">Manage drafts, submissions and published products.</p></Link>
          <Link to="/marketplace/seller-analytics" className="rounded-2xl border bg-white p-5 hover:border-cyan-400"><BarChart3 className="text-cyan-700"/><h3 className="mt-3 font-black">Analytics</h3><p className="text-sm text-slate-600">Track product performance, sales and ratings.</p></Link>
          <Link to="/tutor/finance" className="rounded-2xl border bg-white p-5 hover:border-cyan-400"><Users className="text-cyan-700"/><h3 className="mt-3 font-black">Earnings & Wallet</h3><p className="text-sm text-slate-600">View wallet balances and request payouts.</p></Link>
        </div>
      </div>
    </TutorLayout>
  );
}
