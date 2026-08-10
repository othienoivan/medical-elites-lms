import { httpsCallable } from "firebase/functions";
import { functions } from "../../../config/firebase";
import type { MarketplaceProduct } from "../domain/models";
import { MarketplaceCommerceRepository } from "../infrastructure/marketplace-commerce-repository";

export type MarketplaceCheckoutInput = {
  fullName: string;
  email: string;
  phoneNumber?: string;
  paymentMethod: "card" | "mobile_money";
  returnUrl: string;
  idempotencyKey: string;
  couponCode?: string;
};


export type TutorProductCheckoutInput = {
  productId: string;
  paymentMethod?: "card" | "mobile_money";
  phoneNumber?: string;
  returnUrl: string;
  idempotencyKey: string;
  couponCode?: string;
};
export const MarketplaceCommerceService = {
  ...MarketplaceCommerceRepository,
  async addToCart(uid: string, product: MarketplaceProduct): Promise<void> {
    const cart = await MarketplaceCommerceRepository.getCart(uid);
    if (cart.items.length > 0 && cart.items.some((item) => item.price.currency !== product.price.currency)) {
      throw new Error("Your cart can contain only one currency at a time.");
    }
    await MarketplaceCommerceRepository.addToCart(uid, product);
  },
  async buyProduct(input: TutorProductCheckoutInput): Promise<{ checkoutUrl: string; transactionReference: string; invoiceId: string; paymentIntentId?: string }> {
    const callable = httpsCallable<
      TutorProductCheckoutInput & { purpose: "marketplace" },
      { checkoutUrl: string; transactionReference: string; invoiceId: string; paymentIntentId?: string }
    >(functions, "createCommerceCheckout");
    const response = await callable({ ...input, purpose: "marketplace" });
    return response.data;
  },

  async reconcilePayment(input: { transactionReference: string; transactionId?: string; status?: string }): Promise<{ status: string; transactionReference: string; transactionId?: string; alreadyProcessed?: boolean }> {
    const callable = httpsCallable<
      { transactionReference: string; transactionId?: string; status?: string },
      { status: string; transactionReference: string; transactionId?: string; alreadyProcessed?: boolean }
    >(functions, "reconcileCommercePayment");
    const response = await callable(input);
    return response.data;
  },
  async upsertCoupon(input: Record<string, unknown>): Promise<{ couponId: string }> {
    const callable = httpsCallable<Record<string, unknown>, { couponId: string }>(functions, "upsertMarketplaceCoupon");
    const response = await callable(input);
    return response.data;
  },

  async validateCoupon(input: { code: string; productId: string }): Promise<{ code: string; discountAmount: number; totalAmount: number; currency: string }> {
    const callable = httpsCallable<typeof input, { code: string; discountAmount: number; totalAmount: number; currency: string }>(functions, "validateMarketplaceCoupon");
    const response = await callable(input);
    return response.data;
  },

  async checkout(input: MarketplaceCheckoutInput): Promise<{ checkoutUrl: string; transactionReference: string; invoiceId: string }> {
    const callable = httpsCallable<typeof input, { checkoutUrl: string; transactionReference: string; invoiceId: string }>(functions, "createMarketplaceCartCheckout");
    const response = await callable(input);
    return response.data;
  },
};
