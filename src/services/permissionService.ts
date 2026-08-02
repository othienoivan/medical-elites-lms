import type { AccessScope } from "../firebase/accessScope";

export type OwnedTenantRecord = {
  tenantId?: string;
  institutionId?: string;
  ownerUserId?: string;
  createdByUid?: string;
  createdBy?: string;
  tutorUid?: string;
  tutorId?: string;
  assignedTutorIds?: string[];
};

function sameTenant(scope: AccessScope, record: OwnedTenantRecord): boolean {
  const scopeTenant = scope.tenantId ?? scope.institutionId;
  const recordTenant = record.tenantId ?? record.institutionId;
  return Boolean(scopeTenant && recordTenant && scopeTenant === recordTenant);
}

function owns(scope: AccessScope, record: OwnedTenantRecord): boolean {
  return [
    record.ownerUserId,
    record.createdByUid,
    record.createdBy,
    record.tutorUid,
    record.tutorId,
  ].includes(scope.uid) || Boolean(record.assignedTutorIds?.includes(scope.uid));
}

export const PermissionService = {
  canReadOperationalRecord(scope: AccessScope, record: OwnedTenantRecord): boolean {
    if (scope.role === "tutor") return owns(scope, record);
    if (scope.role === "admin") return sameTenant(scope, record);
    return sameTenant(scope, record);
  },

  canManageOperationalRecord(scope: AccessScope, record: OwnedTenantRecord): boolean {
    if (scope.role === "admin") return sameTenant(scope, record);
    if (scope.role === "tutor") return owns(scope, record);
    return false;
  },

  canViewWallet(scope: AccessScope, wallet: OwnedTenantRecord): boolean {
    if (scope.role === "tutor") return owns(scope, wallet);
    if (scope.role === "admin") return sameTenant(scope, wallet);
    return false;
  },
};
