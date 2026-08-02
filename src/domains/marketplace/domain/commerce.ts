import type { MarketplaceCurrency, MarketplaceMoney } from "./models";

export interface MarketplaceCartItem {
  productId: string;
  title: string;
  sellerId: string;
  sellerName: string;
  thumbnailUrl?: string;
  quantity: number;
  price: MarketplaceMoney;
  addedAt?: unknown;
}

export interface MarketplaceCart {
  id: string;
  customerUid: string;
  currency?: MarketplaceCurrency;
  items: MarketplaceCartItem[];
  updatedAt?: unknown;
}

export interface MarketplaceWishlist {
  id: string;
  customerUid: string;
  productIds: string[];
  updatedAt?: unknown;
}

export type MarketplaceOrderStatus = "pending" | "checkout_created" | "fulfilled" | "verification_failed" | "checkout_failed" | "cancelled" | "refunded";

export interface MarketplaceOrder {
  id: string;
  transactionReference: string;
  customerUid: string;
  customerEmail?: string;
  customerName?: string;
  purpose: "marketplace";
  title: string;
  amount: MarketplaceMoney;
  status: MarketplaceOrderStatus;
  invoiceId?: string;
  itemCount: number;
  productIds: string[];
  createdAt?: unknown;
  fulfilledAt?: unknown;
}

export interface MarketplacePurchase {
  id: string;
  customerUid: string;
  orderId: string;
  productId: string;
  sellerId: string;
  amount: MarketplaceMoney;
  entitlementId?: string;
  status: "active" | "refunded" | "revoked";
  createdAt?: unknown;
}
