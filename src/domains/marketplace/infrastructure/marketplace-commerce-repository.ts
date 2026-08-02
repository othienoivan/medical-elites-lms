import { collection, doc, documentId, getDoc, getDocs, limit, orderBy, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import { db } from "../../../config/firebase";
import type { MarketplaceCart, MarketplaceCartItem, MarketplaceOrder, MarketplaceProduct, MarketplacePurchase, MarketplaceWishlist } from "../domain/models";

function mapDoc<T>(snapshot: { id: string; data(): unknown }): T { return { id: snapshot.id, ...(snapshot.data() as object) } as T; }

export const MarketplaceCommerceRepository = {
  async getCart(uid: string): Promise<MarketplaceCart> {
    const snap = await getDoc(doc(db, "marketplaceCarts", uid));
    return snap.exists() ? mapDoc<MarketplaceCart>(snap) : { id: uid, customerUid: uid, items: [] };
  },
  async saveCart(uid: string, items: MarketplaceCartItem[]): Promise<void> {
    const currencies = [...new Set(items.map((item) => item.price.currency))];
    await setDoc(doc(db, "marketplaceCarts", uid), { customerUid: uid, items, currency: currencies.length === 1 ? currencies[0] : null, updatedAt: serverTimestamp() }, { merge: true });
  },
  async addToCart(uid: string, product: MarketplaceProduct): Promise<void> {
    const cart = await this.getCart(uid);
    const existing = cart.items.find((item) => item.productId === product.id);
    const items = existing
      ? cart.items.map((item) => item.productId === product.id ? { ...item, quantity: Math.min(1, item.quantity + 1) } : item)
      : [...cart.items, { productId: product.id, title: product.title, sellerId: product.sellerId, sellerName: product.sellerName, thumbnailUrl: product.thumbnailUrl, quantity: 1, price: product.price }];
    await this.saveCart(uid, items);
  },
  async removeFromCart(uid: string, productId: string): Promise<void> {
    const cart = await this.getCart(uid);
    await this.saveCart(uid, cart.items.filter((item) => item.productId !== productId));
  },
  async clearCart(uid: string): Promise<void> { await this.saveCart(uid, []); },
  async getWishlist(uid: string): Promise<MarketplaceWishlist> {
    const snap = await getDoc(doc(db, "marketplaceWishlists", uid));
    return snap.exists() ? mapDoc<MarketplaceWishlist>(snap) : { id: uid, customerUid: uid, productIds: [] };
  },
  async saveWishlist(uid: string, productIds: string[]): Promise<void> {
    await setDoc(doc(db, "marketplaceWishlists", uid), { customerUid: uid, productIds: [...new Set(productIds)].slice(0, 200), updatedAt: serverTimestamp() }, { merge: true });
  },
  async toggleWishlist(uid: string, productId: string): Promise<boolean> {
    const wishlist = await this.getWishlist(uid);
    const exists = wishlist.productIds.includes(productId);
    await this.saveWishlist(uid, exists ? wishlist.productIds.filter((id) => id !== productId) : [...wishlist.productIds, productId]);
    return !exists;
  },
  async listWishlistProducts(uid: string): Promise<MarketplaceProduct[]> {
    const wishlist = await this.getWishlist(uid);
    const chunks: string[][] = [];
    for (let i = 0; i < wishlist.productIds.length; i += 10) chunks.push(wishlist.productIds.slice(i, i + 10));
    const results = await Promise.all(chunks.map(async (ids) => {
      const snap = await getDocs(query(collection(db, "marketplaceProducts"), where(documentId(), "in", ids)));
      return snap.docs.map((item) => mapDoc<MarketplaceProduct>(item));
    }));
    return results.flat().filter((product) => product.status === "published");
  },
  async listOrders(uid: string): Promise<MarketplaceOrder[]> {
    const snap = await getDocs(query(collection(db, "commerceOrders"), where("customerUid", "==", uid), where("purpose", "==", "marketplace"), orderBy("createdAt", "desc"), limit(100)));
    return snap.docs.map((item) => mapDoc<MarketplaceOrder>(item));
  },
  async listPurchases(uid: string): Promise<MarketplacePurchase[]> {
    const snap = await getDocs(query(collection(db, "marketplacePurchases"), where("customerUid", "==", uid), orderBy("createdAt", "desc"), limit(200)));
    return snap.docs.map((item) => mapDoc<MarketplacePurchase>(item));
  },
};
