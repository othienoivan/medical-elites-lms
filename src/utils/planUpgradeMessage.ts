import type { EntitlementDecision, UsageMetric } from "./entitlements";

const metricLabels: Record<UsageMetric, string> = {
  students: "students",
  tutors: "tutors",
  courseUnits: "course units",
  storageBytes: "storage",
  aiCredits: "monthly AI credits",
};

export function planUpgradeMessage(decision: EntitlementDecision, metric?: UsageMetric): string {
  if (decision.reason === "usage_limit_reached" && metric) {
    const label = metricLabels[metric];
    return `You've reached your current plan limit${typeof decision.limit === "number" ? ` of ${decision.limit.toLocaleString()} ${label}` : ""}. Upgrade your plan to add more ${label}.`;
  }
  if (decision.reason === "feature_not_in_plan") {
    return "This feature is not included in your current plan. Upgrade to unlock it.";
  }
  return "Your current plan does not allow this action.";
}
