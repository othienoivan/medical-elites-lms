import type { TenantRole, TenantType } from "../models/Tenant";
import type { UserRole } from "../models/User";

export type AccessScope = {
  uid: string;
  role: UserRole;
  tenantId?: string;
  tenantType?: TenantType;
  tenantRoles?: TenantRole[];
  institutionId?: string;
  programmeIds?: string[];
  assignedCourseUnitIds?: string[];
  linkedTutorIds?: string[];
};

export function requireAccessScope(scope: AccessScope | null | undefined): AccessScope {
  if (!scope?.uid || !scope.role) {
    throw new Error("Your account access profile is not ready. Please sign out and sign in again.");
  }
  return scope;
}

export function recordTenantId(
  data: { tenantId?: unknown; institutionId?: unknown },
): string | undefined {
  if (typeof data.tenantId === "string" && data.tenantId.trim()) {
    return data.tenantId.trim();
  }
  if (typeof data.institutionId === "string" && data.institutionId.trim()) {
    return data.institutionId.trim();
  }
  return undefined;
}

export function belongsToAccessTenant(
  data: { tenantId?: unknown; institutionId?: unknown },
  scope: AccessScope,
): boolean {
  const activeTenantId = scope.tenantId ?? scope.institutionId;
  const dataTenantId = recordTenantId(data);
  return Boolean(activeTenantId && dataTenantId && activeTenantId === dataTenantId);
}
