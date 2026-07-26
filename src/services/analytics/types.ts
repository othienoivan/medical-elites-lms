export type AnalyticsRole = "student" | "tutor" | "admin";
export type KpiTone = "blue" | "green" | "amber" | "purple" | "teal" | "rose";

export interface AnalyticsKpi {
  id: string;
  label: string;
  value: number | string;
  helper: string;
  tone: KpiTone;
}

export interface AnalyticsActivity {
  id: string;
  title: string;
  detail: string;
  occurredAt?: Date;
  category: "academic" | "assessment" | "clinical" | "communication" | "system";
}

export interface AnalyticsSnapshot {
  institutionId: string;
  generatedAt: Date;
  role: AnalyticsRole;
  kpis: AnalyticsKpi[];
  activity: AnalyticsActivity[];
  source: "live" | "snapshot" | "fallback";
}
