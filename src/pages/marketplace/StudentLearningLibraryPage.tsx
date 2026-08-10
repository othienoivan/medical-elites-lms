import { refreshMarketplaceLearningAccess } from "../../domains/finance/infrastructure/commerceRepository";
import {
  BookOpen,
  Library,
  Search,
  ShoppingBag,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { Link } from "react-router-dom";

import {
  MarketplaceCommerceService,
  MarketplaceService,
  type MarketplaceProduct,
  type MarketplaceProductType,
  type MarketplacePurchase,
} from "../../domains/marketplace";
import useAuth from "../../hooks/useAuth";

type LibraryEntry = {
  purchase: MarketplacePurchase;
  product: MarketplaceProduct;
};

const typeLabels: Partial<
  Record<MarketplaceProductType, string>
> = {
  course: "Courses",
  course_unit: "Courses",
  lesson: "Lessons",
  document: "Documents",
  pdf: "Documents",
  powerpoint: "Documents",
  question_bank: "Question Banks",
  exam_package: "Examination Packages",
  mock_exam: "Mock Examinations",
  clinical_skills: "Clinical Skills",
  video_course: "Video Courses",
  video: "Videos",
  live_class: "Live Classes",
  membership: "Memberships",
  bundle: "Bundles",
};

function formatDate(value: unknown): string {
  if (!value) {
    return "Date unavailable";
  }

  const candidate = value as {
    toDate?: () => Date;
    seconds?: number;
  };

  const date =
    typeof candidate.toDate === "function"
      ? candidate.toDate()
      : typeof candidate.seconds === "number"
        ? new Date(candidate.seconds * 1000)
        : new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat("en-UG", {
    dateStyle: "medium",
  }).format(date);
}

function productDestination(
  product: MarketplaceProduct,
): string {
  const isCourseProduct = [
    "course",
    "course_unit",
  ].includes(product.type);

  if (
    product.courseUnitId &&
    isCourseProduct
  ) {
    return `/courses/${encodeURIComponent(product.courseUnitId)}`;
  }

  return `/marketplace/products/${product.id}`;
}

export default function StudentLearningLibraryPage() {
  const { currentUser } = useAuth();

  const [entries, setEntries] =
    useState<LibraryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] =
    useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] =
    useState("all");

  useEffect(() => {
    if (!currentUser) {
      setEntries([]);
      setError(null);
      setLoading(false);
      return;
    }

    /*
     * Capture the non-null UID before entering
     * the nested asynchronous function.
     *
     * TypeScript cannot safely preserve the
     * currentUser narrowing inside that closure.
     */
    const userId = currentUser.uid;
    let active = true;

    async function loadLibrary(): Promise<void> {
      setLoading(true);
      setError(null);

      try {
        // Reconcile durable cross-tenant learning grants before resolving owned products.
        // The trusted callable derives grants only from verified active purchases.
        await refreshMarketplaceLearningAccess();
        const purchases =
          await MarketplaceCommerceService.listPurchases(
            userId,
          );

        const activePurchases =
          purchases.filter(
            (purchase) =>
              purchase.status === "active",
          );

        const resolvedEntries =
          await Promise.all(
            activePurchases.map(
              async (
                purchase,
              ): Promise<LibraryEntry | null> => {
                const product =
                  await MarketplaceService.getProduct(
                    purchase.productId,
                  );

                if (!product) {
                  return null;
                }

                return {
                  purchase,
                  product,
                };
              },
            ),
          );

        if (!active) {
          return;
        }

        setEntries(
          resolvedEntries.filter(
            (
              entry,
            ): entry is LibraryEntry =>
              entry !== null,
          ),
        );
      } catch (cause) {
        console.error(
          "Failed to load student learning library",
          cause,
        );

        if (active) {
          setError(
            "Your learning library could not be loaded. Please try again.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadLibrary();

    return () => {
      active = false;
    };
  }, [currentUser]);

  const availableTypes = useMemo(
    () =>
      [
        ...new Set(
          entries.map(
            ({ product }) => product.type,
          ),
        ),
      ].sort(),
    [entries],
  );

  const filteredEntries = useMemo(() => {
    const needle =
      search.trim().toLowerCase();

    return entries.filter(({ product }) => {
      const matchesType =
        typeFilter === "all" ||
        product.type === typeFilter;

      const searchableValues = [
        product.title,
        product.shortDescription,
        product.sellerName,
        product.categoryName,
        ...(product.tags ?? []),
      ];

      const matchesSearch =
        !needle ||
        searchableValues.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(needle),
        );

      return matchesType && matchesSearch;
    });
  }, [
    entries,
    search,
    typeFilter,
  ]);

  if (loading) {
    return (
      <div className="p-12 text-center">
        Loading your learning library…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <Library className="text-blue-700" />

              <h1 className="text-3xl font-black text-slate-950">
                My Learning Library
              </h1>
            </div>

            <p className="mt-2 max-w-2xl text-slate-600">
              Open learning products granted
              through your fulfilled marketplace
              purchases.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              to="/student/purchases"
              className="rounded-xl border bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:border-blue-300"
            >
              My Purchases
            </Link>

            <Link
              to="/student/marketplace"
              className="rounded-xl bg-blue-700 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
            {error}
          </div>
        )}

        <section className="mt-8 grid gap-3 rounded-2xl border bg-white p-4 md:grid-cols-[1fr_16rem]">
          <label className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-3 text-slate-400"
              size={20}
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search your purchased learning resources"
              className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500"
            />
          </label>

          <select
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(event.target.value)
            }
            className="rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:border-blue-500"
          >
            <option value="all">
              All resource types
            </option>

            {availableTypes.map((type) => (
              <option
                key={type}
                value={type}
              >
                {typeLabels[type] ??
                  type.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </section>

        {entries.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-dashed bg-white p-12 text-center">
            <ShoppingBag
              className="mx-auto text-slate-400"
              size={42}
            />

            <h2 className="mt-4 text-xl font-black">
              Your library is empty
            </h2>

            <p className="mt-2 text-slate-600">
              Fulfilled purchases will appear
              here automatically.
            </p>

            <Link
              to="/student/marketplace"
              className="mt-5 inline-flex rounded-xl bg-blue-700 px-5 py-3 font-bold text-white hover:bg-blue-800"
            >
              Explore Marketplace
            </Link>
          </section>
        ) : filteredEntries.length === 0 ? (
          <section className="mt-8 rounded-2xl border bg-white p-10 text-center text-slate-600">
            No library items match the
            selected search and filter.
          </section>
        ) : (
          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredEntries.map(
              ({ purchase, product }) => (
                <article
                  key={purchase.id}
                  className="overflow-hidden rounded-3xl border bg-white shadow-sm"
                >
                  <div className="aspect-[16/9] bg-slate-100">
                    {product.thumbnailUrl ? (
                      <img
                        src={
                          product.thumbnailUrl
                        }
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen
                          className="text-slate-400"
                          size={44}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black uppercase text-emerald-700">
                        Owned
                      </span>

                      <span className="text-xs font-bold text-slate-500">
                        {typeLabels[
                          product.type
                        ] ??
                          product.type.replaceAll(
                            "_",
                            " ",
                          )}
                      </span>
                    </div>

                    <h2 className="mt-4 text-lg font-black text-slate-950">
                      {product.title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-600">
                      By{" "}
                      {product.sellerName ||
                        "Medical Elites tutor"}
                    </p>

                    <p className="mt-3 text-xs text-slate-500">
                      Added{" "}
                      {formatDate(
                        purchase.createdAt,
                      )}
                    </p>

                    <Link
                      to={productDestination(
                        product,
                      )}
                      className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-black text-white hover:bg-blue-800"
                    >
                      Open Product
                    </Link>
                  </div>
                </article>
              ),
            )}
          </section>
        )}
      </main>
    </div>
  );
}