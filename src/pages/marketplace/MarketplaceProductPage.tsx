import {
  BookOpen,
  CheckCircle2,
  Clock,
  Heart,
  ShieldCheck,
  ShoppingCart,
  Star,
  Store,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  MarketplaceCommerceService,
  MarketplaceIntelligenceService,
  MarketplaceReviews,
  MarketplaceService,
  type MarketplaceProduct,
} from "../../domains/marketplace";
import useAuth from "../../hooks/useAuth";

function money(amount: number, currency: string) {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function MarketplaceProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState<MarketplaceProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponSummary, setCouponSummary] = useState<{ discountAmount: number; totalAmount: number; currency: string } | null>(null);
  const [related, setRelated] = useState<MarketplaceProduct[]>([]);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadProduct = async () => {
      try {
        const item = await MarketplaceService.getProduct(productId);
        if (cancelled) return;

        setProduct(item);

        if (item?.status === "published") {
          await MarketplaceIntelligenceService.recordView(
            currentUser?.uid ?? null,
            item.id,
          );

          const recommendations =
            await MarketplaceIntelligenceService.listRecommendations(item);

          if (!cancelled) {
            setRelated(recommendations);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId, currentUser?.uid]);

  if (loading) {
    return <div className="p-12 text-center">Loading product…</div>;
  }

  const isOwner = Boolean(
    product &&
      currentUser &&
      (product.sellerId === currentUser.uid ||
        product.ownerTutorUid === currentUser.uid),
  );

  if (!product || (product.status !== "published" && !isOwner)) {
    return (
      <div className="mx-auto max-w-3xl p-12 text-center">
        <h1 className="text-3xl font-black">Product unavailable</h1>
        <Link
          to="/marketplace"
          className="mt-4 inline-block text-cyan-700"
        >
          Return to marketplace
        </Link>
      </div>
    );
  }

  const handleAddToCart = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      await MarketplaceCommerceService.addToCart(currentUser.uid, product);
      setMessage("Added to cart.");
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : "Unable to add to cart.",
      );
    }
  };

  const handleBuyNow = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    if (product.sellerId === currentUser.uid) {
      setMessage("You cannot purchase your own product.");
      return;
    }
    setBuying(true);
    setMessage(null);
    try {
      const result = await MarketplaceCommerceService.buyProduct({
        productId: product.id,
        paymentMethod: "card",
        returnUrl: `${window.location.origin}/student/purchases?payment=complete`,
        idempotencyKey: crypto.randomUUID(),
        couponCode: couponCode.trim().toUpperCase() || undefined,
      });
      window.location.assign(result.checkoutUrl);
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : "Unable to start checkout.");
      setBuying(false);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) { setCouponSummary(null); setMessage("Enter a coupon code."); return; }
    try {
      const result = await MarketplaceCommerceService.validateCoupon({ code: couponCode.trim().toUpperCase(), productId: product.id });
      setCouponSummary(result);
      setMessage(`Coupon ${result.code} applied.`);
    } catch (cause) { setCouponSummary(null); setMessage(cause instanceof Error ? cause.message : "Unable to apply coupon."); }
  };

  const handleToggleWishlist = async () => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    try {
      await MarketplaceCommerceService.toggleWishlist(
        currentUser.uid,
        product.id,
      );
      setMessage("Wishlist updated.");
    } catch (cause) {
      setMessage(
        cause instanceof Error ? cause.message : "Unable to update wishlist.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto grid max-w-7xl gap-10 px-4 py-10 lg:grid-cols-[1fr_380px]">
        <section>
          {isOwner ? (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
              <div>
                <p className="font-black">Tutor preview</p>
                <p className="text-sm">
                  This product is currently <strong>{product.status}</strong>. Only you can view it until it is published.
                </p>
              </div>
              <Link
                to="/tutor/commerce/products"
                className="rounded-xl border border-amber-400 bg-white px-4 py-2 text-sm font-black"
              >
                Back to My Products
              </Link>
            </div>
          ) : (
            <Link to="/marketplace" className="text-sm font-bold text-cyan-700">
              ← Marketplace
            </Link>
          )}

          <div className="mt-5 overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-100 to-blue-100">
            {product.thumbnailUrl ? (
              <img
                src={product.thumbnailUrl}
                alt=""
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center">
                <BookOpen size={72} className="text-cyan-700" />
              </div>
            )}
          </div>

          <div className="mt-8">
            <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-black uppercase text-cyan-800">
              {product.type.replaceAll("_", " ")}
            </span>
            <h1 className="mt-4 text-4xl font-black text-slate-950">
              {product.title}
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              {product.shortDescription}
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-700">
              <span className="flex items-center gap-1">
                <Star
                  className="fill-amber-400 text-amber-400"
                  size={18}
                />
                {product.ratingAverage.toFixed(1)} ({product.ratingCount})
              </span>
              <span>{product.salesCount} learners</span>
              <Link
                to={`/marketplace/sellers/${product.sellerId}`}
                className="flex items-center gap-1 font-bold text-cyan-700"
              >
                <Store size={17} />
                {product.sellerName}
              </Link>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border bg-white p-7">
            <h2 className="text-2xl font-black">About this product</h2>
            <p className="mt-4 whitespace-pre-wrap leading-7 text-slate-700">
              {product.description}
            </p>
          </div>

          {product.learningOutcomes.length > 0 && (
            <div className="mt-6 rounded-2xl border bg-white p-7">
              <h2 className="text-2xl font-black">What you will learn</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {product.learningOutcomes.map((outcome) => (
                  <li key={outcome} className="flex gap-2 text-slate-700">
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-emerald-600"
                      size={19}
                    />
                    {outcome}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {product.status === "published" && (
            <MarketplaceReviews productId={product.id} />
          )}

          {related.length > 0 && (
            <section className="mt-6 rounded-2xl border bg-white p-7">
              <h2 className="text-2xl font-black">Related products</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={item.id}
                    to={`/marketplace/products/${item.id}`}
                    className="rounded-xl border p-4 hover:border-cyan-400"
                  >
                    <p className="font-black">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {item.shortDescription}
                    </p>
                    <p className="mt-3 font-bold text-cyan-700">
                      {money(item.price.amount, item.price.currency)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </section>

        <aside>
          <div className="sticky top-6 rounded-3xl border bg-white p-7 shadow-lg">
            <p className="text-3xl font-black">
              {money(couponSummary?.totalAmount ?? product.price.amount, couponSummary?.currency ?? product.price.currency)}
            </p>
            {couponSummary && <p className="mt-1 text-sm font-bold text-emerald-700">You save {money(couponSummary.discountAmount, couponSummary.currency)}</p>}

            {isOwner ? (
              <div className="mt-6 space-y-3">
                <div className="rounded-xl bg-slate-100 p-4 text-sm text-slate-700">
                  <p className="font-black text-slate-950">Product status</p>
                  <p className="mt-1 capitalize">{product.status.replaceAll("_", " ")}</p>
                </div>
                <Link
                  to={`/tutor/commerce/products/${product.id}/edit`}
                  className="flex w-full items-center justify-center rounded-xl bg-cyan-700 px-5 py-4 font-black text-white"
                >
                  Edit Product
                </Link>
              </div>
            ) : (
              <>
                <div className="mt-5 rounded-xl bg-slate-50 p-3">
                  <label className="text-xs font-black uppercase text-slate-600">Coupon code</label>
                  <div className="mt-2 flex gap-2"><input value={couponCode} onChange={(e)=>setCouponCode(e.target.value.toUpperCase())} className="min-w-0 flex-1 rounded-lg border bg-white px-3 py-2" placeholder="WELCOME10"/><button type="button" onClick={() => void handleApplyCoupon()} className="rounded-lg border border-cyan-700 px-3 py-2 text-sm font-black text-cyan-800">Apply</button></div>
                </div>
                <button
                  type="button"
                  disabled={buying}
                  onClick={() => void handleBuyNow()}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-4 font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ShoppingCart size={20} />
                  {buying ? "Opening secure checkout…" : "Buy now"}
                </button>

                <button
                  type="button"
                  onClick={() => void handleAddToCart()}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-700 px-5 py-4 font-black text-cyan-800"
                >
                  <ShoppingCart size={20} />
                  Add to cart
                </button>

                <button
                  type="button"
                  onClick={() => void handleToggleWishlist()}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-4 font-black"
                >
                  <Heart size={20} />
                  Save to wishlist
                </button>
              </>
            )}

            {message && (
              <p className="mt-3 rounded-lg bg-cyan-50 p-3 text-sm font-bold text-cyan-800">
                {message}
              </p>
            )}

            <div className="mt-6 space-y-3 text-sm text-slate-700">
              <p className="flex items-center gap-2">
                <ShieldCheck className="text-emerald-600" />
                Secure Flutterwave commerce
              </p>
              <p className="flex items-center gap-2">
                <Clock className="text-cyan-700" />
                {product.accessType.replaceAll("_", " ")} access
              </p>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
