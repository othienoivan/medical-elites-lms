import { getFirestore } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";
import type { CallableRequest } from "firebase-functions/v2/https";
import type { AiAssistantRequest, UserAccess } from "../types";

export async function resolveUserAccess(
  request: CallableRequest<AiAssistantRequest>
): Promise<UserAccess> {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Sign in to use the AI assistant.");
  }

  const profile = await getFirestore()
    .collection("users")
    .doc(request.auth.uid)
    .get();

  const rawRole = String(profile.data()?.role ?? "student");
  const role: UserAccess["role"] =
    rawRole === "admin" || rawRole === "tutor" ? rawRole : "student";

  return {
    uid: request.auth.uid,
    email: String(request.auth.token.email ?? ""),
    role,
  };
}

export function enforceModeAccess(mode: string, role: UserAccess["role"]): void {
  if (mode.startsWith("tutor_") && role !== "tutor" && role !== "admin") {
    throw new HttpsError(
      "permission-denied",
      "Tutor AI tools require a tutor or administrator account."
    );
  }
}
