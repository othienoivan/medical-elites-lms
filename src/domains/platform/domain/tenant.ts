import type { EntityId, ISODateTime } from "../../shared";

export type TenantType = "platform" | "institution" | "independent_tutor";
export type TenantStatus = "trial" | "active" | "past_due" | "suspended" | "closed";

export interface TenantBranding {
  readonly displayName: string;
  readonly logoUrl?: string;
  readonly primaryColor?: string;
  readonly secondaryColor?: string;
  readonly customDomain?: string;
}

export interface Tenant {
  readonly id: EntityId;
  readonly type: TenantType;
  readonly status: TenantStatus;
  readonly ownerUserId: EntityId;
  readonly legacyInstitutionId?: EntityId;
  readonly branding: TenantBranding;
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface TenantRepository {
  findById(tenantId: EntityId): Promise<Tenant | null>;
  listForUser(userId: EntityId): Promise<readonly Tenant[]>;
  save(tenant: Tenant): Promise<void>;
}
