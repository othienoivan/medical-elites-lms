export const featureKeys = [
  "learning.core",
  "assessment.question_bank",
  "assessment.exam_builder",
  "ai.lesson_generation",
  "ai.question_generation",
  "erp.core",
  "marketplace.sell",
  "marketplace.buy",
  "analytics.advanced",
  "branding.white_label",
] as const;

export type FeatureKey = (typeof featureKeys)[number];

export interface EntitlementSnapshot {
  readonly tenantId: string;
  readonly planId: string;
  readonly enabledFeatures: ReadonlySet<FeatureKey>;
  readonly limits: Readonly<Record<string, number>>;
}

export function canUseFeature(snapshot: EntitlementSnapshot, feature: FeatureKey): boolean {
  return snapshot.enabledFeatures.has(feature);
}
