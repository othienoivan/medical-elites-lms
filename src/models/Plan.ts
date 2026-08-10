import type { Timestamp } from "firebase/firestore";

export type PlanAudience = "institution" | "tutor" | "student";
export type BillingInterval = "monthly" | "annual" | "none";
export type PlanStatus = "draft" | "active" | "retired";

export const ENTITLEMENT_KEYS = [
  "AI_QUESTION_GENERATION",
  "AI_LESSON_GENERATION",
  "PROFESSIONAL_EXAM_BUILDER",
  "MARKETPLACE_SELLING",
  "ERP_MODULES",
  "ADVANCED_ANALYTICS",
  "CERTIFICATE_ISSUANCE",
  "WHITE_LABEL",
] as const;

export type EntitlementKey = (typeof ENTITLEMENT_KEYS)[number];

export interface PlanLimits {
  maxStudents: number;
  maxTutors: number;
  maxCourseUnits: number;
  storageBytes: number;
  monthlyAiCredits: number;
}

export interface Plan {
  id: string;
  name: string;
  code: string;
  audience: PlanAudience;
  billingInterval: BillingInterval;
  priceMinor: number;
  currency: string;
  commissionBasisPoints: number;
  enabledEntitlements: EntitlementKey[];
  limits: PlanLimits;
  isActive: boolean;
  status?: PlanStatus;
  trialDays?: number;
  description?: string;
  createdAt?: Date | Timestamp | null;
  updatedAt?: Date | Timestamp | null;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  planId: string;
  status: "trialing" | "active" | "past_due" | "cancelled" | "expired" | "suspended";
  currentPeriodStart?: Date | Timestamp | null;
  currentPeriodEnd?: Date | Timestamp | null;
  trialEndsAt?: Date | Timestamp | null;
  cancelAtPeriodEnd?: boolean;
  source?: string;
  customerUid?: string;
  autoRenew?: boolean;
  lastPaymentId?: string;
  lastProviderTransactionId?: string;
  startedAt?: Date | Timestamp | string | null;
  expiredAt?: Date | Timestamp | string | null;
  cancellationRequestedAt?: Date | Timestamp | string | null;
}
