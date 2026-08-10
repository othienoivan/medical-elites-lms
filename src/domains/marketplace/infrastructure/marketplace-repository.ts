import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../../config/firebase";
import type {
  MarketplaceCategory,
  MarketplaceProduct,
  SellerProfile,
} from "../domain/models";

const products = collection(db, "marketplaceProducts");
const categories = collection(db, "marketplaceCategories");

function normalizeProduct(
  snapshot: { id: string; data(): unknown },
): MarketplaceProduct {
  const raw = snapshot.data() as Record<string, unknown>;

  const rawPrice = raw.price as
    | {
        amount?: unknown;
        currency?: unknown;
      }
    | undefined;

  const amount = Number(
    rawPrice?.amount ??
      raw.priceAmount ??
      raw.priceMinor ??
      raw.salePrice ??
      0,
  );

  const currency = String(
    rawPrice?.currency ??
      raw.currency ??
      "UGX",
  ) as MarketplaceProduct["price"]["currency"];

  const sellerId = String(
    raw.sellerId ??
      raw.ownerTutorUid ??
      raw.tutorId ??
      "",
  );

  return {
    ...(raw as unknown as MarketplaceProduct),

    id: snapshot.id,

    sellerId,

    ownerTutorUid:
      String(
        raw.ownerTutorUid ??
          raw.sellerId ??
          raw.tutorId ??
          "",
      ) || undefined,

    price: {
      amount: Number.isFinite(amount)
        ? amount
        : 0,
      currency,
    },

    learningOutcomes: Array.isArray(
      raw.learningOutcomes,
    )
      ? raw.learningOutcomes.map(String)
      : [],

    linkedResourceIds: Array.isArray(
      raw.linkedResourceIds,
    )
      ? raw.linkedResourceIds.map(String)
      : [],

    tags: Array.isArray(raw.tags)
      ? raw.tags.map(String)
      : [],

    ratingAverage: Number(
      raw.ratingAverage ?? 0,
    ),

    ratingCount: Number(
      raw.ratingCount ?? 0,
    ),

    salesCount: Number(
      raw.salesCount ?? 0,
    ),

    featured: raw.featured === true,
  };
}

function mapDoc<T>(
  snapshot: {
    id: string;
    data(): unknown;
  },
): T {
  return {
    id: snapshot.id,
    ...(snapshot.data() as object),
  } as T;
}

function removeUndefinedDeep<T>(
  value: T,
): T {
  if (Array.isArray(value)) {
    return value
      .filter(
        (item) =>
          item !== undefined,
      )
      .map(
        (item) =>
          removeUndefinedDeep(item),
      ) as T;
  }

  if (
    value !== null &&
    typeof value === "object"
  ) {
    const cleaned =
      Object.fromEntries(
        Object.entries(
          value as Record<
            string,
            unknown
          >,
        )
          .filter(
            ([, item]) =>
              item !== undefined,
          )
          .map(
            ([key, item]) => [
              key,
              removeUndefinedDeep(
                item,
              ),
            ],
          ),
      );

    return cleaned as T;
  }

  return value;
}

export const MarketplaceRepository =
  {
    async listPublished(
      max = 60,
    ): Promise<
      MarketplaceProduct[]
    > {
      const snap =
        await getDocs(
          query(
            products,
            where(
              "status",
              "==",
              "published",
            ),
            orderBy(
              "publishedAt",
              "desc",
            ),
            limit(max),
          ),
        );

      return snap.docs.map(
        (item) =>
          normalizeProduct(item),
      );
    },

    async listFeatured(
      max = 12,
    ): Promise<
      MarketplaceProduct[]
    > {
      const snap =
        await getDocs(
          query(
            products,
            where(
              "status",
              "==",
              "published",
            ),
            where(
              "featured",
              "==",
              true,
            ),
            orderBy(
              "publishedAt",
              "desc",
            ),
            limit(max),
          ),
        );

      return snap.docs.map(
        (item) =>
          normalizeProduct(item),
      );
    },

    async listSellerProducts(
      sellerId: string,
      includeDrafts = false,
    ): Promise<
      MarketplaceProduct[]
    > {
      const constraints =
        includeDrafts
          ? [
              where(
                "sellerId",
                "==",
                sellerId,
              ),
              orderBy(
                "updatedAt",
                "desc",
              ),
            ]
          : [
              where(
                "sellerId",
                "==",
                sellerId,
              ),
              where(
                "status",
                "==",
                "published",
              ),
              orderBy(
                "publishedAt",
                "desc",
              ),
            ];

      const snap =
        await getDocs(
          query(
            products,
            ...constraints,
          ),
        );

      return snap.docs.map(
        (item) =>
          normalizeProduct(item),
      );
    },

    async getProduct(
      id: string,
    ): Promise<
      MarketplaceProduct | null
    > {
      const snap =
        await getDoc(
          doc(
            db,
            "marketplaceProducts",
            id,
          ),
        );

      return snap.exists()
        ? normalizeProduct(snap)
        : null;
    },

    async createProduct(
      input: Omit<
        MarketplaceProduct,
        | "id"
        | "createdAt"
        | "updatedAt"
        | "publishedAt"
      >,
    ): Promise<string> {
      const payload =
        removeUndefinedDeep(
          input,
        );

      const created =
        await addDoc(
          products,
          {
            ...payload,

            createdAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp(),

            publishedAt:
              input.status ===
              "published"
                ? serverTimestamp()
                : null,
          },
        );

      return created.id;
    },

    async updateProduct(
      id: string,
      patch: Partial<
        MarketplaceProduct
      >,
    ): Promise<void> {
      const payload =
        removeUndefinedDeep(
          patch,
        );

      await updateDoc(
        doc(
          db,
          "marketplaceProducts",
          id,
        ),
        {
          ...payload,

          updatedAt:
            serverTimestamp(),

          ...(patch.status ===
          "published"
            ? {
                publishedAt:
                  serverTimestamp(),
              }
            : {}),
        },
      );
    },

    async listCategories(): Promise<
      MarketplaceCategory[]
    > {
      const snap =
        await getDocs(
          query(
            categories,
            where(
              "active",
              "==",
              true,
            ),
            orderBy(
              "sortOrder",
              "asc",
            ),
          ),
        );

      return snap.docs.map(
        (item) =>
          mapDoc<MarketplaceCategory>(
            item,
          ),
      );
    },

    async getSeller(
      id: string,
    ): Promise<
      SellerProfile | null
    > {
      const snap =
        await getDoc(
          doc(
            db,
            "sellerProfiles",
            id,
          ),
        );

      return snap.exists()
        ? mapDoc<SellerProfile>(
            snap,
          )
        : null;
    },

    async getSellerBySlug(
      slug: string,
    ): Promise<
      SellerProfile | null
    > {
      const normalizedSlug =
        slug
          .trim()
          .toLowerCase();

      if (
        !normalizedSlug
      ) {
        return null;
      }

      const snap =
        await getDocs(
          query(
            collection(
              db,
              "sellerProfiles",
            ),
            where(
              "slug",
              "==",
              normalizedSlug,
            ),
            limit(1),
          ),
        );

      if (
        snap.empty
      ) {
        return null;
      }

      return mapDoc<SellerProfile>(
        snap.docs[0],
      );
    },

    async upsertSeller(
      profile: SellerProfile,
    ): Promise<void> {
      const sellerId =
        String(
          profile.id || "",
        ).trim();

      const ownerUid =
        String(
          profile.ownerUid ||
            "",
        ).trim();

      if (!sellerId) {
        throw new Error(
          "A storefront seller ID is required.",
        );
      }

      if (
        !ownerUid ||
        ownerUid !== sellerId
      ) {
        throw new Error(
          "The storefront owner does not match the authenticated tutor.",
        );
      }

      const normalizedSlug =
        typeof profile.slug ===
        "string"
          ? profile.slug
              .trim()
              .toLowerCase()
          : profile.slug;

      const payload =
        removeUndefinedDeep({
          ...profile,

          id: sellerId,

          ownerUid,
          status: profile.status ?? "active",

          slug:
            normalizedSlug,
        });

      await setDoc(
        doc(
          db,
          "sellerProfiles",
          sellerId,
        ),
        {
          ...payload,

          updatedAt:
            serverTimestamp(),
        },
        {
          merge: true,
        },
      );
    },
  };