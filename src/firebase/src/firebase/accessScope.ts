import type { UserRole } from "../models/User";

export type AccessScope = {
  uid: string;
  role: UserRole;
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
