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
  async checkout(input: MarketplaceCheckoutInput): Promise<{ checkoutUrl: string; transactionReference: string; invoiceId: string }> {
    const callable = httpsCallable<typeof input, { checkoutUrl: string; transactionReference: string; invoiceId: string }>(functions, "createMarketplaceCartCheckout");
    const response = await callable(input);
    return response.data;
  },
};
