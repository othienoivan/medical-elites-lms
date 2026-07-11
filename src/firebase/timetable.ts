import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { TimetableEntry } from "../models/Timetable";

const COLLECTION = "timetableEntries";
type NewEntry = Omit<TimetableEntry, "id" | "createdAt" | "updatedAt">;

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}


function removeUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedValues(item)) as T;
  }

  if (value instanceof Date || value === null || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, removeUndefinedValues(item)])
  ) as T;
}

function fromSnapshot(id: string, data: Record<string, unknown>): TimetableEntry {
  return {
    ...(data as unknown as TimetableEntry),
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function getTimetableEntries(): Promise<TimetableEntry[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("dayOfWeek", "asc"))
  );
  return snapshot.docs.map((item) => fromSnapshot(item.id, item.data()));
}

export async function saveTimetableEntry(entry: NewEntry, entryId?: string) {
  const payload = removeUndefinedValues({
    ...entry,
    courseUnitCode: entry.courseUnitCode ?? "",
    updatedAt: serverTimestamp(),
  });
  if (entryId) {
    await updateDoc(doc(db, COLLECTION, entryId), payload);
    return entryId;
  }
  const reference = await addDoc(collection(db, COLLECTION), {
    ...payload,
    createdAt: serverTimestamp(),
  });
  return reference.id;
}

export async function deleteTimetableEntry(entryId: string) {
  await deleteDoc(doc(db, COLLECTION, entryId));
}
