import type {
  LicenseGrant,
  PlatformAnnouncement,
  PlatformAuditLog,
  PlatformFeatureFlag,
  PlatformPlan,
  PlatformTenant,
  PlatformUsageRecord,
  RoadmapItem,
  SupportTicket,
} from "../domain/platformTypes";
import {
  createPlatformRecord,
  getPlatformRecord,
  listPlatformRecords,
  removePlatformRecord,
  savePlatformRecord,
  updatePlatformRecord,
  type PlatformCollectionName,
} from "../infrastructure/platformRepository";

export const platformCollections = {
  tenants: "tenants",
  plans: "plans",
  flags: "featureFlags",
  audits: "auditLogs",
  tickets: "supportTickets",
  announcements: "platformAnnouncements",
  usage: "platformUsage",
  roadmap: "roadmapItems",
  licenses: "licenseGrants",
  settings: "platformSettings",
} as const satisfies Record<string, PlatformCollectionName>;

export const PlatformService = {
  listTenants: () => listPlatformRecords<PlatformTenant>(platformCollections.tenants),
  getTenant: (id: string) => getPlatformRecord<PlatformTenant>(platformCollections.tenants, id),
  listPlans: () => listPlatformRecords<PlatformPlan>(platformCollections.plans),
  listFlags: () => listPlatformRecords<PlatformFeatureFlag>(platformCollections.flags),
  listAudits: () => listPlatformRecords<PlatformAuditLog>(platformCollections.audits),
  listTickets: () => listPlatformRecords<SupportTicket>(platformCollections.tickets),
  listAnnouncements: () => listPlatformRecords<PlatformAnnouncement>(platformCollections.announcements),
  listUsage: () => listPlatformRecords<PlatformUsageRecord>(platformCollections.usage),
  listRoadmap: () => listPlatformRecords<RoadmapItem>(platformCollections.roadmap),
  listLicenses: () => listPlatformRecords<LicenseGrant>(platformCollections.licenses),
  create: createPlatformRecord,
  save: savePlatformRecord,
  update: updatePlatformRecord,
  remove: removePlatformRecord,
};

export function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function calculateCommission(amount: number, commissionPercent: number): {
  platformAmount: number;
  sellerAmount: number;
} {
  const safePercent = Math.min(100, Math.max(0, commissionPercent));
  const platformAmount = Math.round((amount * safePercent) / 100);
  return { platformAmount, sellerAmount: amount - platformAmount };
}
