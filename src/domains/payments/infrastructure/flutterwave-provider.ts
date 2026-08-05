import { httpsCallable } from "firebase/functions";
import { functions } from "../../../config/firebase";
import type { PaymentInitialization, PaymentProvider, PaymentRequest } from "../domain/models";
export const FlutterwavePaymentProvider: PaymentProvider = {
  id: "flutterwave",
  async initializePayment(input: PaymentRequest): Promise<PaymentInitialization> {
    const callable = httpsCallable<PaymentRequest, Omit<PaymentInitialization,"provider">>(functions,"createCommerceCheckout");
    const response = await callable(input);
    return {...response.data, provider:"flutterwave"};
  },
  async verifyPayment(reference: string, transactionId: string) {
    const callable = httpsCallable<{transactionReference:string;transactionId:string},{status:string;transactionReference:string}>(functions,"reconcileCommercePayment");
    return (await callable({transactionReference:reference,transactionId})).data;
  },
};
