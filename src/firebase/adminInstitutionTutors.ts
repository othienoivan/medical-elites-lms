import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";

export type InstitutionTutorMembership = {
  membershipId: string;
  tenantId: string;
  tutorUid: string;
  fullName: string;
  email: string;
  status: string;
  independent: boolean;
};

export async function getInstitutionTutorMemberships(): Promise<{ tenantId: string; items: InstitutionTutorMembership[] }> {
  const callable = httpsCallable<Record<string, never>, { tenantId: string; items: InstitutionTutorMembership[] }>(functions, "getInstitutionTutorMemberships");
  return (await callable({})).data;
}

export async function setInstitutionTutorAccess(tutorUid: string, status: "active" | "inactive"): Promise<void> {
  const callable = httpsCallable<{ tutorUid: string; status: "active" | "inactive" }, unknown>(functions, "setInstitutionTutorAccess");
  await callable({ tutorUid, status });
}

export async function removeTutorFromInstitution(tutorUid: string): Promise<void> {
  const callable = httpsCallable<{ tutorUid: string }, unknown>(functions, "removeTutorFromInstitution");
  await callable({ tutorUid });
}
