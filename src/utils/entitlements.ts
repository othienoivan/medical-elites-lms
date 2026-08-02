import type { EntitlementKey, Plan } from "../models/Plan";

export type UsageMetric = "students" | "tutors" | "courseUnits" | "storageBytes" | "aiCredits";

export function hasEntitlement(plan: Plan | null | undefined, key: EntitlementKey): boolean {
  return Boolean(plan?.isActive && plan.enabledEntitlements.includes(key));
}

export function planLimit(plan: Plan | null | undefined, metric: UsageMetric): number {
  if (!plan) return 0;
  if (metric === "students") return plan.limits.maxStudents;
  if (metric === "tutors") return plan.limits.maxTutors;
  if (metric === "courseUnits") return plan.limits.maxCourseUnits;
  if (metric === "storageBytes") return plan.limits.storageBytes;
  return plan.limits.monthlyAiCredits;
}

export function isWithinLimit(plan: Plan | null | undefined, metric: UsageMetric, currentUsage: number, increment = 1): boolean {
  const limit = planLimit(plan, metric);
  return limit < 0 || currentUsage + increment <= limit;
}

export function platformCommissionAmount(amountMinor: number, plan: Plan | null | undefined): number {
  const basisPoints = plan?.commissionBasisPoints ?? 5000;
  return Math.round((amountMinor * basisPoints) / 10_000);
}
