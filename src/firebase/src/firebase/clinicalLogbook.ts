import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type {
  ClinicalEntryStatus,
  ClinicalLogbookEntry,
} from "../models/ClinicalLogbook";
import { writeAuditLog } from "./auditLogs";

const COLLECTION = "clinicalLogbookEntries";

type NewClinicalEntry = Omit<
  ClinicalLogbookEntry,
  "id" | "createdAt" | "updatedAt" | "reviewedAt" | "submittedAt"
>;

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}

function fromSnapshot(
  id: string,
  data: Record<string, unknown>
): ClinicalLogbookEntry {
  return {
    ...(data as unknown as ClinicalLogbookEntry),
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
    reviewedAt: toDate(data.reviewedAt) ?? null,
    submittedAt: toDate(data.submittedAt) ?? null,
  };
}

function clean<T>(value: T): T {
  if (Array.isArray(value)) return value.map((item) => clean(item)) as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const output: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      if (item !== undefined) output[key] = clean(item);
    });
    return output as T;
  }
  return value;
}

export async function createClinicalEntry(
  entry: NewClinicalEntry
): Promise<string> {
  const reference = await addDoc(collection(db, COLLECTION),
    clean({
      ...entry,
      submittedAt: entry.status === "submitted" ? serverTimestamp() : null,
      reviewedAt: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  void writeAuditLog({
    action: "clinical_logbook.create",
    actorUid: entry.studentAuthUid,
    actorRole: "student",
    resourceType: "clinicalLogbookEntry",
    resourceId: reference.id,
    summary: `Created clinical logbook entry: ${entry.procedureName}`,
    metadata: { status: entry.status, clinicalHours: entry.clinicalHours },
  });
  return reference.id;
}

export async function getClinicalEntryById(
  entryId: string
): Promise<ClinicalLogbookEntry | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, entryId));
  return snapshot.exists()
    ? fromSnapshot(snapshot.id, snapshot.data())
    : null;
}

export async function getClinicalEntriesByStudent(
  studentAuthUid: string
): Promise<ClinicalLogbookEntry[]> {
  const snapshot = await getDocs(
    query(
      collection(db, COLLECTION),
      where("studentAuthUid", "==", studentAuthUid)
    )
  );
  return snapshot.docs
    .map((item) => fromSnapshot(item.id, item.data()))
    .sort((a, b) => b.procedureDate.localeCompare(a.procedureDate));
}

export async function getAllClinicalEntries(tutorUid: string): Promise<ClinicalLogbookEntry[]> {
  if (!tutorUid) return [];
  const results = await Promise.allSettled([
    getDocs(query(collection(db, COLLECTION), where("reviewedByUid", "==", tutorUid))),
    getDocs(query(collection(db, COLLECTION), where("assignedTutorIds", "array-contains", tutorUid))),
  ]);
  const documents = results.flatMap((result) => result.status === "fulfilled" ? result.value.docs : []);
  return [...new Map(documents.map((item) => [item.id, item])).values()]
    .map((item) => fromSnapshot(item.id, item.data()))
    .sort(
      (a, b) =>
        (b.submittedAt?.getTime() || b.createdAt?.getTime() || 0) -
        (a.submittedAt?.getTime() || a.createdAt?.getTime() || 0)
    );
}

export async function updateClinicalEntry(
  entryId: string,
  updates: Partial<ClinicalLogbookEntry>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, entryId),
    clean({
      ...updates,
      ...(updates.status === "submitted"
        ? { submittedAt: serverTimestamp() }
        : {}),
      updatedAt: serverTimestamp(),
    })
  );
}

export async function reviewClinicalEntry(input: {
  entryId: string;
  status: Extract<ClinicalEntryStatus, "approved" | "returned" | "rejected">;
  tutorComment: string;
  reviewedByUid: string;
  reviewedByName: string;
  competencyLevel: import("../models/ClinicalLogbook").CompetencyLevel;
  communicationScore: number;
  clinicalReasoningScore: number;
  professionalismScore: number;
  proceduralSkillScore: number;
}): Promise<void> {
  await updateDoc(doc(db, COLLECTION, input.entryId), {
    status: input.status,
    tutorComment: input.tutorComment.trim(),
    reviewedByUid: input.reviewedByUid,
    reviewedByName: input.reviewedByName,
    competencyLevel: input.competencyLevel,
    communicationScore: input.communicationScore,
    clinicalReasoningScore: input.clinicalReasoningScore,
    professionalismScore: input.professionalismScore,
    proceduralSkillScore: input.proceduralSkillScore,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  void writeAuditLog({
    action: "clinical_logbook.review",
    actorUid: input.reviewedByUid,
    actorRole: "tutor",
    resourceType: "clinicalLogbookEntry",
    resourceId: input.entryId,
    summary: `Reviewed clinical logbook entry: ${input.status}`,
    metadata: { status: input.status, competencyLevel: input.competencyLevel },
  });
}
