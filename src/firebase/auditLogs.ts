import { addDoc, collection, serverTimestamp } from "firebase/firestore";

import { db } from "../config/firebase";

export type AuditAction =
  | "clinical_logbook.create"
  | "clinical_logbook.update"
  | "clinical_logbook.review"
  | "examination.create"
  | "examination.update"
  | "examination.delete"
  | "examination.version_create";

export interface AuditEventInput {
  action: AuditAction;
  actorUid: string;
  actorRole: "student" | "tutor" | "admin";
  institutionId?: string | null;
  resourceType: "clinicalLogbookEntry" | "examination";
  resourceId: string;
  summary: string;
  metadata?: Record<string, string | number | boolean | null>;
}

/**
 * Audit logging must never interrupt the user's primary action. Firestore rules
 * validate identity, immutable fields, allowed action names and payload size.
 */
export async function writeAuditLog(input: AuditEventInput): Promise<void> {
  try {
    await addDoc(collection(db, "auditLogs"), {
      ...input,
      institutionId: input.institutionId ?? null,
      metadata: input.metadata ?? {},
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
  }
}
