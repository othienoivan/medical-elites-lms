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

export async function getAllClinicalEntries(): Promise<ClinicalLogbookEntry[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));
  return snapshot.docs
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
}): Promise<void> {
  await updateDoc(doc(db, COLLECTION, input.entryId), {
    status: input.status,
    tutorComment: input.tutorComment.trim(),
    reviewedByUid: input.reviewedByUid,
    reviewedByName: input.reviewedByName,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
