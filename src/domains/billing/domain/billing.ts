import type { CurrencyCode, EntityId, ISODateTime } from "../../shared";

export type BillingCycle = "monthly" | "annual";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "suspended" | "cancelled";

export interface Money {
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
}

export interface Plan {
  readonly id: EntityId;
  readonly audience: "institution" | "tutor" | "student";
  readonly name: string;
  readonly billingCycle: BillingCycle;
  readonly price: Money;
  readonly featureKeys: readonly string[];
  readonly limits: Readonly<Record<string, number>>;
  readonly platformCommissionBasisPoints: number;
  readonly active: boolean;
}

export interface Subscription {
  readonly id: EntityId;
  readonly tenantId: EntityId;
  readonly planId: EntityId;
  readonly status: SubscriptionStatus;
  readonly currentPeriodStart: ISODateTime;
  readonly currentPeriodEnd: ISODateTime;
}
