import { getFunctions, httpsCallable } from "firebase/functions";
import app from "../config/firebase";

export type DonationFrequency = "one_time" | "monthly";
export type DonationMethod = "mobile_money" | "card";

export type DonationRequest = {
  amount: number;
  currency: "UGX";
  frequency: DonationFrequency;
  method: DonationMethod;
  fullName: string;
  email: string;
  phoneNumber?: string;
  anonymous?: boolean;
  purpose?: string;
  returnUrl?: string;
};

type DonationCheckoutResponse = { checkoutUrl: string; transactionReference: string };

export async function createDonationCheckout(input: DonationRequest): Promise<DonationCheckoutResponse> {
  const functions = getFunctions(app, "us-central1");
  const callable = httpsCallable<DonationRequest, DonationCheckoutResponse>(functions, "createDonationCheckout");
  const response = await callable(input);
  if (!response.data.checkoutUrl) throw new Error("The payment gateway did not return a checkout link.");
  return response.data;
}
