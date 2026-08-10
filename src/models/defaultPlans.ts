import type { Plan } from "./Plan";

export const TUTOR_FREE_PLAN_ID = "tutor_free";

/**
 * Client-side compatibility snapshot for an independent tutor whose canonical
 * plan document has not loaded yet. The server remains authoritative for paid
 * subscriptions and writes.
 */
export const TUTOR_FREE_PLAN: Plan = {
  id: TUTOR_FREE_PLAN_ID,
  name: "Free Tutor",
  code: "TUTOR_FREE",
  audience: "tutor",
  billingInterval: "none",
  priceMinor: 0,
  currency: "UGX",
  commissionBasisPoints: 5000,
  enabledEntitlements: ["MARKETPLACE_SELLING"],
  limits: {
    maxStudents: 25,
    maxTutors: 1,
    maxCourseUnits: 3,
    storageBytes: 536_870_912,
    monthlyAiCredits: 0,
  },
  isActive: true,
  status: "active",
  description: "Core tutor access with starter limits. Upgrade only when you need more capacity or advanced tools.",
};

export function effectivePlan(
  plan: Plan | null | undefined,
  audience?: "institution" | "tutor" | "student" | null,
): Plan | null {
  if (plan?.isActive) return plan;
  return audience === "tutor" ? TUTOR_FREE_PLAN : plan ?? null;
}
