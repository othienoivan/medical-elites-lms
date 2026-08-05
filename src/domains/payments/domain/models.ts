export type PaymentProviderId = "flutterwave" | "mtn_momo" | "airtel_money";
export type PaymentPurpose = "subscription" | "marketplace" | "marketplace_purchase" | "student_fee" | "wallet_topup";
export type PaymentStatus = "created" | "pending" | "successful" | "failed" | "cancelled" | "refunded";
export interface PaymentRequest { purpose: PaymentPurpose; planId?: string; productId?: string; fullName: string; email: string; phoneNumber?: string; paymentMethod: "card" | "mobile_money"; returnUrl: string; idempotencyKey: string; billingCycle?: string; }
export interface PaymentInitialization { checkoutUrl: string; transactionReference: string; invoiceId: string; paymentIntentId?: string; provider: PaymentProviderId; }
export interface PaymentProvider { readonly id: PaymentProviderId; initializePayment(input: PaymentRequest): Promise<PaymentInitialization>; verifyPayment(reference: string, transactionId: string): Promise<{status:string;transactionReference:string}>; }
