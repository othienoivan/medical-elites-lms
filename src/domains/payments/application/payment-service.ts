import type { PaymentProvider, PaymentProviderId, PaymentRequest } from "../domain/models";
import { FlutterwavePaymentProvider } from "../infrastructure/flutterwave-provider";
const providers: Record<PaymentProviderId, PaymentProvider> = { flutterwave: FlutterwavePaymentProvider, mtn_momo: FlutterwavePaymentProvider, airtel_money: FlutterwavePaymentProvider };
export const PaymentService = {
  provider(id: PaymentProviderId = "flutterwave"): PaymentProvider { if (id !== "flutterwave") throw new Error(`${id} is not enabled yet.`); return providers[id]; },
  initialize(input: PaymentRequest, provider: PaymentProviderId = "flutterwave") { return this.provider(provider).initializePayment(input); },
};
