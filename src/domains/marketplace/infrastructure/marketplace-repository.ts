import { addDoc, collection, doc, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { MarketplaceCategory, MarketplaceProduct, SellerProfile } from "../domain/models";

const products = collection(db, "marketplaceProducts");
const categories = collection(db, "marketplaceCategories");

function mapDoc<T>(snapshot: { id: string; data(): unknown }): T { return { id: snapshot.id, ...(snapshot.data() as object) } as T; }

export const MarketplaceRepository = {
  async listPublished(max = 60): Promise<MarketplaceProduct[]> {
    const snap = await getDocs(query(products, where("status", "==", "published"), orderBy("publishedAt", "desc"), limit(max)));
    return snap.docs.map((item) => mapDoc<MarketplaceProduct>(item));
  },
  async listFeatured(max = 12): Promise<MarketplaceProduct[]> {
    const snap = await getDocs(query(products, where("status", "==", "published"), where("featured", "==", true), orderBy("publishedAt", "desc"), limit(max)));
    return snap.docs.map((item) => mapDoc<MarketplaceProduct>(item));
  },
  async listSellerProducts(sellerId: string, includeDrafts = false): Promise<MarketplaceProduct[]> {
    const constraints = includeDrafts
      ? [where("sellerId", "==", sellerId), orderBy("updatedAt", "desc")]
      : [where("sellerId", "==", sellerId), where("status", "==", "published"), orderBy("publishedAt", "desc")];
    const snap = await getDocs(query(products, ...constraints));
    return snap.docs.map((item) => mapDoc<MarketplaceProduct>(item));
  },
  async getProduct(id: string): Promise<MarketplaceProduct | null> {
    const snap = await getDoc(doc(db, "marketplaceProducts", id));
    return snap.exists() ? mapDoc<MarketplaceProduct>(snap) : null;
  },
  async createProduct(input: Omit<MarketplaceProduct, "id" | "createdAt" | "updatedAt" | "publishedAt">): Promise<string> {
    const created = await addDoc(products, { ...input, createdAt: serverTimestamp(), updatedAt: serverTimestamp(), publishedAt: input.status === "published" ? serverTimestamp() : null });
    return created.id;
  },
  async updateProduct(id: string, patch: Partial<MarketplaceProduct>): Promise<void> {
    await updateDoc(doc(db, "marketplaceProducts", id), { ...patch, updatedAt: serverTimestamp(), ...(patch.status === "published" ? { publishedAt: serverTimestamp() } : {}) });
  },
  async listCategories(): Promise<MarketplaceCategory[]> {
    const snap = await getDocs(query(categories, where("active", "==", true), orderBy("sortOrder", "asc")));
    return snap.docs.map((item) => mapDoc<MarketplaceCategory>(item));
  },
  async getSeller(id: string): Promise<SellerProfile | null> {
    const snap = await getDoc(doc(db, "sellerProfiles", id));
    return snap.exists() ? mapDoc<SellerProfile>(snap) : null;
  },
  async upsertSeller(profile: SellerProfile): Promise<void> {
    await setDoc(doc(db, "sellerProfiles", profile.id), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
  },
};
