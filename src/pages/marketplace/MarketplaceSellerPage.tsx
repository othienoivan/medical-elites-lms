import {
  BookOpen,
  Copy,
  ExternalLink,
  Search,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import useAuth from "../../hooks/useAuth";
import {
  MarketplaceService,
  type MarketplaceProduct,
  type MarketplaceProductType,
  type SellerProfile,
} from "../../domains/marketplace";

const TYPE_LABELS: Partial<Record<MarketplaceProductType, string>> = {
  course: "Courses",
  course_unit: "Course units",
  document: "Notes & documents",
  question_bank: "Question banks",
  exam_package: "Exam packages",
  mock_exam: "Mock exams",
  clinical_skills: "Clinical skills",
  video_course: "Video courses",
  live_class: "Live classes",
  membership: "Memberships",
  bundle: "Bundles",
};

function formatMoney(product: MarketplaceProduct): string {
  return new Intl.NumberFormat("en-UG", {
    style: "currency",
    currency: product.price.currency,
    maximumFractionDigits: 0,
  }).format(product.salePrice?.amount ?? product.price.amount);
}

export default function MarketplaceSellerPage() {
  const { sellerId } = useParams();
  const { currentUser } = useAuth();
  const resolvedSellerId = sellerId === "me" ? currentUser?.uid : sellerId;
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<MarketplaceProductType | "all">("all");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!resolvedSellerId) {
      setError("This tutor store could not be identified.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    void (async () => {
      const direct = await MarketplaceService.getSeller(resolvedSellerId);
      const profile = direct ?? await MarketplaceService.getSellerBySlug(resolvedSellerId);
      const sellerProducts = profile ? await MarketplaceService.listSellerProducts(profile.id) : [];
      return [profile, sellerProducts] as const;
    })()
      .then(([profile, sellerProducts]) => {
        if (!profile) {
          setError("This tutor storefront is not available.");
          return;
        }
        setSeller(profile);
        setProducts(sellerProducts.filter((product) => product.status === "published"));
      })
      .catch((cause) => {
        console.error("Failed to load tutor storefront", cause);
        setError("The tutor storefront could not be loaded. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [resolvedSellerId]);

  const availableTypes = useMemo(() => {
    return Array.from(new Set(products.map((product) => product.type)));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesType = typeFilter === "all" || product.type === typeFilter;
      const matchesSearch =
        !term ||
        product.title.toLowerCase().includes(term) ||
        product.shortDescription.toLowerCase().includes(term) ||
        product.categoryName.toLowerCase().includes(term) ||
        product.tags.some((tag) => tag.toLowerCase().includes(term));
      return matchesType && matchesSearch;
    });
  }, [products, searchTerm, typeFilter]);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured).slice(0, 3),
    [products],
  );

  const copyStoreLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-600">Loading tutor store…</div>;
  }

  if (error || !seller) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <Store className="mx-auto text-slate-400" size={48} />
        <h1 className="mt-5 text-2xl font-black text-slate-900">Store unavailable</h1>
        <p className="mt-2 text-slate-600">{error || "This tutor storefront is not available."}</p>
        <Link className="mt-6 inline-flex rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white" to="/marketplace">
          Return to marketplace
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="relative overflow-hidden bg-slate-950 text-white">
        {seller.bannerUrl && <img src={seller.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />}
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-cyan-100 text-cyan-800">
                {seller.photoUrl ? (
                  <img src={seller.photoUrl} alt={seller.displayName} className="h-full w-full object-cover" />
                ) : (
                  <Store size={42} />
                )}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-black sm:text-4xl">{seller.displayName}</h1>
                  {seller.verified && <ShieldCheck className="text-cyan-300" aria-label="Verified tutor" />}
                </div>
                {seller.headline && <p className="mt-2 font-semibold text-cyan-200">{seller.headline}</p>}
                <p className="mt-1 text-slate-300">{seller.institutionName || "Independent tutor"}</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-200">
                  <span className="flex items-center gap-2">
                    <Star className="fill-amber-400 text-amber-400" size={17} />
                    {seller.ratingAverage.toFixed(1)} ({seller.ratingCount} reviews)
                  </span>
                  <span>{products.length} published products</span>
                  <span>{seller.followerCount} followers</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void copyStoreLink()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 px-4 py-3 font-bold hover:bg-slate-900"
            >
              <Copy size={18} /> {copied ? "Link copied" : "Share store"}
            </button>
          </div>
          {seller.welcomeMessage && <p className="mt-7 max-w-3xl text-lg font-bold text-white">{seller.welcomeMessage}</p>}
          {seller.bio && <p className="mt-4 max-w-3xl leading-7 text-slate-300">{seller.bio}</p>}
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-slate-200">
            {seller.qualifications && <span className="rounded-full bg-white/10 px-3 py-1.5">{seller.qualifications}</span>}
            {(seller.specialties ?? []).map((item) => <span key={item} className="rounded-full bg-white/10 px-3 py-1.5">{item}</span>)}
            {seller.teachingExperienceYears !== undefined && <span className="rounded-full bg-white/10 px-3 py-1.5">{seller.teachingExperienceYears} years teaching</span>}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-10 px-4 py-10">
        {currentUser?.uid === seller.ownerUid && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
            <div><p className="font-black text-cyan-950">Store owner preview</p><p className="text-sm text-cyan-800">Only you can see these management controls.</p></div>
            <div className="flex flex-wrap gap-2">
              <Link to="/tutor/commerce/storefront" className="rounded-xl bg-cyan-700 px-4 py-2.5 font-bold text-white">Edit storefront</Link>
              <Link to="/tutor/commerce/products" className="rounded-xl border border-cyan-300 bg-white px-4 py-2.5 font-bold text-cyan-800">Manage products</Link>
              <Link to="/marketplace/seller-analytics" className="rounded-xl border border-cyan-300 bg-white px-4 py-2.5 font-bold text-cyan-800">Analytics</Link>
            </div>
          </div>
        )}
        {featuredProducts.length > 0 && (
          <section>
            <div className="flex items-center gap-2">
              <Star className="fill-amber-400 text-amber-500" />
              <h2 className="text-2xl font-black text-slate-950">Featured products</h2>
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-3">
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/marketplace/products/${product.id}`}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex h-40 items-center justify-center bg-slate-100">
                    {product.thumbnailUrl ? (
                      <img src={product.thumbnailUrl} alt={product.title} className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="text-slate-400" size={42} />
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs font-black uppercase tracking-wide text-cyan-700">
                      {TYPE_LABELS[product.type] ?? product.type.replaceAll("_", " ")}
                    </span>
                    <h3 className="mt-2 text-lg font-black text-slate-950">{product.title}</h3>
                    <p className="mt-3 font-black text-cyan-800">{formatMoney(product)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-slate-950">Products by {seller.displayName}</h2>
              <p className="mt-1 text-sm text-slate-600">Browse this tutor's published learning resources.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
              <label className="relative block min-w-64 flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search this store..."
                  className="w-full rounded-xl border bg-white py-3 pl-10 pr-4 outline-none focus:border-cyan-600"
                />
              </label>
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value as MarketplaceProductType | "all")}
                className="rounded-xl border bg-white px-4 py-3 outline-none focus:border-cyan-600"
              >
                <option value="all">All product types</option>
                {availableTypes.map((type) => (
                  <option key={type} value={type}>
                    {TYPE_LABELS[type] ?? type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed bg-white p-12 text-center">
              <Store className="mx-auto text-slate-400" size={40} />
              <h3 className="mt-4 font-black text-slate-900">No matching products</h3>
              <p className="mt-1 text-sm text-slate-600">Try another search term or product type.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/marketplace/products/${product.id}`}
                  className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
                >
                  <div className="flex h-44 items-center justify-center bg-slate-100">
                    {product.thumbnailUrl ? (
                      <img src={product.thumbnailUrl} alt={product.title} className="h-full w-full object-cover" />
                    ) : (
                      <BookOpen className="text-slate-400" size={42} />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-xs font-black uppercase text-cyan-700">
                        {TYPE_LABELS[product.type] ?? product.type.replaceAll("_", " ")}
                      </span>
                      {product.featured && <span className="rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-800">FEATURED</span>}
                    </div>
                    <h3 className="mt-2 text-xl font-black text-slate-950 group-hover:text-cyan-800">{product.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{product.shortDescription}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="font-black text-slate-950">{formatMoney(product)}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-cyan-700">
                        View <ExternalLink size={15} />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
