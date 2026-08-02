import { useMemo } from "react";
import useAuth from "./useAuth";
import useTenant from "./useTenant";
import type { AccessScope } from "../firebase/accessScope";

export default function useAccessScope(): AccessScope | null {
  const { currentUser, userProfile, role } = useAuth();
  const { activeTenant, activeMembership } = useTenant();

  return useMemo(() => {
    if (!currentUser || !role) return null;

    const tenantId = activeTenant?.id ?? userProfile?.institutionId;
    const institutionId =
      activeTenant?.legacyInstitutionId
      ?? (activeTenant?.type === "institution" ? activeTenant.id : undefined)
      ?? userProfile?.institutionId;

    return {
      uid: currentUser.uid,
      role,
      tenantId,
      tenantType: activeTenant?.type,
      tenantRoles: activeMembership?.roles ?? [],
      institutionId,
      programmeIds: userProfile?.programmeIds ?? [],
      assignedCourseUnitIds: userProfile?.assignedCourseUnitIds ?? [],
      linkedTutorIds: userProfile?.linkedTutorIds ?? [],
    };
  }, [activeMembership, activeTenant, currentUser, role, userProfile]);
}
