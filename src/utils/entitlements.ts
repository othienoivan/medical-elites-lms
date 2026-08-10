import type { EntitlementKey, Plan } from "../models/Plan";
import { effectivePlan } from "../models/defaultPlans";

export type UsageMetric = "students" | "tutors" | "courseUnits" | "storageBytes" | "aiCredits";
export type PlanAudience = "institution" | "tutor" | "student";

export type EntitlementDecision = {
  allowed: boolean;
  reason: "allowed" | "feature_not_in_plan" | "usage_limit_reached";
  limit?: number;
  currentUsage?: number;
  upgradeRecommended: boolean;
};

export function hasEntitlement(
  plan: Plan | null | undefined,
  key: EntitlementKey,
  audience?: PlanAudience,
): boolean {
  const resolved = effectivePlan(plan, audience);
  return Boolean(resolved?.isActive && resolved.enabledEntitlements.includes(key));
}

export function planLimit(
  plan: Plan | null | undefined,
  metric: UsageMetric,
  audience?: PlanAudience,
): number {
  const resolved = effectivePlan(plan, audience);
  if (!resolved) return 0;
  if (metric === "students") return resolved.limits.maxStudents;
  if (metric === "tutors") return resolved.limits.maxTutors;
  if (metric === "courseUnits") return resolved.limits.maxCourseUnits;
  if (metric === "storageBytes") return resolved.limits.storageBytes;
  return resolved.limits.monthlyAiCredits;
}

export function isWithinLimit(
  plan: Plan | null | undefined,
  metric: UsageMetric,
  currentUsage: number,
  increment = 1,
  audience?: PlanAudience,
): boolean {
  const limit = planLimit(plan, metric, audience);
  return limit < 0 || currentUsage + increment <= limit;
}

export function entitlementDecision(input: {
  plan: Plan | null | undefined;
  audience?: PlanAudience;
  entitlement?: EntitlementKey;
  metric?: UsageMetric;
  currentUsage?: number;
  increment?: number;
}): EntitlementDecision {
  const { plan, audience, entitlement, metric, currentUsage = 0, increment = 1 } = input;

  if (entitlement && !hasEntitlement(plan, entitlement, audience)) {
    return { allowed: false, reason: "feature_not_in_plan", upgradeRecommended: true };
  }

  if (metric) {
    const limit = planLimit(plan, metric, audience);
    if (!(limit < 0 || currentUsage + increment <= limit)) {
      return {
        allowed: false,
        reason: "usage_limit_reached",
        limit,
        currentUsage,
        upgradeRecommended: true,
      };
    }
  }

  return { allowed: true, reason: "allowed", upgradeRecommended: false };
}

export function platformCommissionAmount(
  amountMinor: number,
  plan: Plan | null | undefined,
  audience?: PlanAudience,
): number {
  const resolved = effectivePlan(plan, audience);
  const basisPoints = resolved?.commissionBasisPoints ?? 5000;
  return Math.round((amountMinor * basisPoints) / 10_000);
}
