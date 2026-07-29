import { useMemo } from "react";
import useAuth from "./useAuth";
import type { AccessScope } from "../firebase/accessScope";

export default function useAccessScope(): AccessScope | null {
  const { currentUser, userProfile, role } = useAuth();

  return useMemo(() => {
    if (!currentUser || !role) return null;
    return {
      uid: currentUser.uid,
      role,
      institutionId: userProfile?.institutionId,
      programmeIds: userProfile?.programmeIds ?? [],
      assignedCourseUnitIds: userProfile?.assignedCourseUnitIds ?? [],
      linkedTutorIds: userProfile?.linkedTutorIds ?? [],
    };
  }, [currentUser, role, userProfile]);
}
