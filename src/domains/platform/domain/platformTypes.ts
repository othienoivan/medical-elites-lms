export interface DomainTimestamp {
  toDate(): Date;
}

export type DomainDate = Date | DomainTimestamp | null;

export type PlatformStatus = "active" | "trial" | "suspended" | "past_due" | "cancelled" | "archived";
export type TenantType = "institution" | "independent_tutor" | "platform";
export type BillingCycle = "monthly" | "annual" | "custom";
export type SupportStatus = "open" | "in_progress" | "resolved" | "closed";
export type SupportPriority = "low" | "normal" | "high" | "urgent";

export interface PlatformRecord {
  id: string;
  createdAt?: DomainDate;
  updatedAt?: DomainDate;
}

export interface PlatformTenant extends PlatformRecord {
  name: string;
  slug: string;
  type: TenantType;
  status: PlatformStatus;
  ownerUid?: string;
  ownerUserId?: string;
  institutionId?: string;
  country?: string;
  currency?: string;
  planId?: string;
  contactEmail?: string;
  contactPhone?: string;
  userCount?: number;
  studentCount?: number;
  tutorCount?: number;
  storageBytes?: number;
  lastActivityAt?: DomainDate;
  suspendedAt?: DomainDate;
  suspensionReason?: string;
  trialEndsAt?: DomainDate;
  licenseEndsAt?: DomainDate;
  branding?: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}

export interface PlatformPlan extends PlatformRecord {
  name: string;
  code: string;
  audience: "institution" | "tutor" | "student";
  status: "draft" | "active" | "retired";
  billingCycle: BillingCycle;
  priceAmount: number;
  currency: string;
  commissionPercent?: number;
  limits: Record<string, number>;
  entitlements: string[];
}

export interface PlatformFeatureFlag extends PlatformRecord {
  key: string;
  name: string;
  description?: string;
  enabled: boolean;
  tenantIds: string[];
  userIds: string[];
}

export interface PlatformAuditLog extends PlatformRecord {
  actorUid: string;
  actorName?: string;
  action: string;
  entityType: string;
  entityId?: string;
  tenantId?: string;
  summary: string;
  metadata?: Record<string, unknown>;
}

export interface SupportTicket extends PlatformRecord {
  subject: string;
  description: string;
  requesterUid: string;
  requesterName?: string;
  tenantId?: string;
  status: SupportStatus;
  priority: SupportPriority;
  assignedToUid?: string;
}

export interface PlatformAnnouncement extends PlatformRecord {
  title: string;
  body: string;
  audience: "all" | "institutions" | "tutors" | "students";
  status: "draft" | "published" | "archived";
  publishedAt?: DomainDate;
}

export interface PlatformUsageRecord extends PlatformRecord {
  tenantId: string;
  period: string;
  aiRequests: number;
  aiTokens: number;
  storageBytes: number;
  activeStudents: number;
  activeTutors: number;
}

export interface RoadmapItem extends PlatformRecord {
  title: string;
  description: string;
  status: "planned" | "in_progress" | "completed";
  votes: number;
  targetRelease?: string;
}

export interface LicenseGrant extends PlatformRecord {
  tenantId: string;
  planId: string;
  status: PlatformStatus;
  source: "subscription" | "trial" | "promotion" | "complimentary" | "manual";
  startsAt?: DomainDate;
  endsAt?: DomainDate;
  notes?: string;
}
