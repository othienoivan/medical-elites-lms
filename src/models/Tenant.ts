import type { Timestamp } from "firebase/firestore";

export type TenantType = "institution" | "independent_tutor" | "platform";
export type TenantStatus = "trial" | "active" | "past_due" | "suspended" | "archived";
export type TenantRole =
  | "owner"
  | "institution_admin"
  | "tutor"
  | "student"
  | "finance_officer"
  | "registrar"
  | "support"
  | "super_admin";

export interface Tenant {
  id: string;
  type: TenantType;
  name: string;
  slug: string;
  status: TenantStatus;
  ownerUserId: string;
  planId: string;
  legacyInstitutionId?: string;
  logoUrl?: string;
  countryCode?: string;
  currency?: string;
  createdAt?: Date | Timestamp | null;
  updatedAt?: Date | Timestamp | null;
}

export interface TenantMembership {
  id: string;
  tenantId: string;
  userId: string;
  roles: TenantRole[];
  status: "invited" | "active" | "suspended" | "removed";
  isDefault?: boolean;
  joinedAt?: Date | Timestamp | null;
  updatedAt?: Date | Timestamp | null;
}
