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

        if (item) {
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

  if (!product || product.status !== "published") {
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
          <Link to="/marketplace" className="text-sm font-bold text-cyan-700">
            ← Marketplace
          </Link>

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

          <MarketplaceReviews productId={product.id} />

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
              {money(product.price.amount, product.price.currency)}
            </p>

            <button
              type="button"
              onClick={() => void handleAddToCart()}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-700 px-5 py-4 font-black text-white"
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
