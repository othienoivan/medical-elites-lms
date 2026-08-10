import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  CircleDollarSign,
  PackageOpen,
  PlusCircle,
  ShoppingBag,
  Store,
  TicketPercent,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import TutorLayout from "../../components/layout/TutorLayout";
import useAuth from "../../hooks/useAuth";
import {
  MarketplaceService,
  type MarketplaceProduct,
} from "../../domains/marketplace";

export default function TutorCommerceDashboardPage() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    setLoading(true);

    void MarketplaceService.listSellerProducts(currentUser.uid, true)
      .then(setProducts)
      .finally(() => setLoading(false));
  }, [currentUser]);

  const metrics = useMemo(() => {
    const published = products.filter(
      (product) => product.status === "published",
    ).length;

    const drafts = products.filter(
      (product) =>
        product.status === "draft" ||
        product.status === "submitted" ||
        product.status === "review",
    ).length;

    const sales = products.reduce(
      (sum, product) => sum + (product.salesCount || 0),
      0,
    );

    const revenue = products.reduce(
      (sum, product) =>
        sum + (product.salesCount || 0) * (product.price?.amount || 0),
      0,
    );

    return {
      published,
      drafts,
      sales,
      revenue,
    };
  }, [products]);

  const cards = [
    ["Products", products.length, PackageOpen],
    ["Published", metrics.published, ShoppingBag],
    ["Drafts & review", metrics.drafts, BarChart3],
    [
      "Estimated gross sales",
      `UGX ${metrics.revenue.toLocaleString()}`,
      CircleDollarSign,
    ],
  ] as const;

  return (
    <TutorLayout
      title="Commerce Centre"
      subtitle="Manage products, sales and your tutor business."
    >
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-white p-5">
          <div>
            <h2 className="text-xl font-black text-slate-900">
              Your marketplace business
            </h2>

            <p className="text-sm text-slate-600">
              Create products from your course units, documents, examinations,
              question banks and live classes.
            </p>
          </div>

          <Link
            to="/tutor/commerce/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-700 px-4 py-3 font-bold text-white"
          >
            <PlusCircle size={18} />
            Create product
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(([label, value, Icon]) => (
            <div
              key={label}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              <Icon className="text-cyan-700" />

              <p className="mt-4 text-sm text-slate-500">{label}</p>

              <p className="text-2xl font-black text-slate-950">
                {loading ? "…" : value}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
          <Link
            to="/tutor/commerce/products"
            className="rounded-2xl border bg-white p-5 hover:border-cyan-400"
          >
            <PackageOpen className="text-cyan-700" />
            <h3 className="mt-3 font-black">My Products</h3>
            <p className="text-sm text-slate-600">
              Manage drafts, submissions and published products.
            </p>
          </Link>

          <Link
            to="/tutor/commerce/orders"
            className="rounded-2xl border bg-white p-5 hover:border-cyan-400"
          >
            <ShoppingBag className="text-cyan-700" />
            <h3 className="mt-3 font-black">Orders & Sales</h3>
            <p className="text-sm text-slate-600">
              Track verified purchases of your products.
            </p>
          </Link>

          <Link
            to="/tutor/commerce/coupons"
            className="rounded-2xl border bg-white p-5 hover:border-cyan-400"
          >
            <TicketPercent className="text-cyan-700" />
            <h3 className="mt-3 font-black">Coupons</h3>
            <p className="text-sm text-slate-600">
              Create discounts for your store and products.
            </p>
          </Link>

          <Link
            to="/marketplace/seller-analytics"
            className="rounded-2xl border bg-white p-5 hover:border-cyan-400"
          >
            <BarChart3 className="text-cyan-700" />
            <h3 className="mt-3 font-black">Analytics</h3>
            <p className="text-sm text-slate-600">
              Track product performance, sales and ratings.
            </p>
          </Link>

          <Link
            to="/tutor/finance"
            className="rounded-2xl border bg-white p-5 hover:border-cyan-400"
          >
            <Users className="text-cyan-700" />
            <h3 className="mt-3 font-black">Earnings & Wallet</h3>
            <p className="text-sm text-slate-600">
              View wallet balances and request payouts.
            </p>
          </Link>

          {currentUser && (
            <Link
              to="/tutor/commerce/storefront"
              className="rounded-2xl border bg-white p-5 hover:border-cyan-400"
            >
              <Store className="text-cyan-700" />
              <h3 className="mt-3 font-black">My Storefront</h3>
              <p className="text-sm text-slate-600">
                Customize, preview and share your public tutor store.
              </p>
            </Link>
          )}

          {currentUser && (
            <Link
              to={`/store/${currentUser.uid}`}
              className="rounded-2xl border bg-white p-5 hover:border-cyan-400"
            >
              <Store className="text-cyan-700" />
              <h3 className="mt-3 font-black">View Public Store</h3>
              <p className="text-sm text-slate-600">
                See your storefront exactly as students and visitors see it.
              </p>
            </Link>
          )}
        </div>
      </div>
    </TutorLayout>
  );
}