import type { EntityId, ISODateTime } from "../../shared";

export const platformRoles = [
  "super_admin",
  "platform_support",
  "institution_owner",
  "institution_admin",
  "tutor",
  "student",
  "finance_officer",
  "registrar",
  "employer",
  "cpd_manager",
] as const;

export type PlatformRole = (typeof platformRoles)[number];

export interface TenantMembership {
  readonly id: EntityId;
  readonly tenantId: EntityId;
  readonly userId: EntityId;
  readonly roles: readonly PlatformRole[];
  readonly status: "invited" | "active" | "suspended" | "revoked";
  readonly createdAt: ISODateTime;
  readonly updatedAt: ISODateTime;
}

export interface IdentityRepository {
  findMembership(tenantId: EntityId, userId: EntityId): Promise<TenantMembership | null>;
  listMembershipsForUser(userId: EntityId): Promise<readonly TenantMembership[]>;
}
