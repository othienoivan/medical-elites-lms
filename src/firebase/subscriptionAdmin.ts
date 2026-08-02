import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import type { BillingInterval, EntitlementKey, PlanAudience, PlanLimits, PlanStatus } from "../models/Plan";

export type SavePlanInput = {
  planId?: string;
  name: string;
  code: string;
  audience: PlanAudience;
  status: PlanStatus;
  billingInterval: BillingInterval;
  priceMinor: number;
  currency: string;
  commissionBasisPoints: number;
  enabledEntitlements: EntitlementKey[];
  limits: PlanLimits;
  trialDays: number;
  description?: string;
};

export type AssignSubscriptionInput = {
  tenantId: string;
  planId: string;
  trialDays?: number;
  status?: "trialing" | "active";
};

export type UpdateSubscriptionStatusInput = {
  tenantId: string;
  status: "active" | "past_due" | "cancelled" | "expired" | "suspended";
  reason?: string;
};

async function call<TInput extends Record<string, unknown>, TResult>(name: string, input: TInput): Promise<TResult> {
  const callable = httpsCallable<TInput, TResult>(functions, name);
  return (await callable(input)).data;
}

export const saveSubscriptionPlan = (input: SavePlanInput) =>
  call<SavePlanInput, { planId: string }>("saveSubscriptionPlan", input);

export const assignTenantSubscription = (input: AssignSubscriptionInput) =>
  call<AssignSubscriptionInput, { subscriptionId: string; status: string }>("assignTenantSubscription", input);

export const updateTenantSubscriptionStatus = (input: UpdateSubscriptionStatusInput) =>
  call<UpdateSubscriptionStatusInput, { subscriptionId: string; status: string }>("updateTenantSubscriptionStatus", input);
