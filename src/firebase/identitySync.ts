import { httpsCallable } from "firebase/functions";

import { functions } from "../config/firebase";

export type IdentitySyncResult = {
  linkedStudent: boolean;
  linkedEnrollments: number;
};

/**
 * Synchronizes academic identity through a trusted callable. Direct browser
 * writes to authUid, academic allocation, institution and linked-tutor fields
 * are intentionally denied by Firestore rules.
 */
export async function synchronizeStudentIdentity(
  _authUid: string,
  _email?: string | null
): Promise<IdentitySyncResult> {
  const callable = httpsCallable<Record<string, never>, IdentitySyncResult>(
    functions,
    "synchronizeStudentIdentity",
  );
  const result = await callable({});
  return result.data;
}
