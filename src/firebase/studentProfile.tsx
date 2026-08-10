import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";

export type StudentProfileUpdateInput = {
  fullName: string;
  phoneNumber: string;
  address: string;
  emergencyContact: string;
};

export async function updateOwnStudentProfile(input: StudentProfileUpdateInput): Promise<void> {
  const callable = httpsCallable<StudentProfileUpdateInput, { updated: boolean }>(functions, "updateOwnStudentProfile");
  await callable(input);
}
