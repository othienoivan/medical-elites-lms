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
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Announcement } from "../models/Announcement";

const COLLECTION = "announcements";
type NewAnnouncement = Omit<Announcement, "id" | "createdAt" | "updatedAt">;

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}

function clean<T>(value: T): T {
  if (Array.isArray(value)) return value.map(clean) as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    const output: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([key, item]) => {
      if (item !== undefined) output[key] = clean(item);
    });
    return output as T;
  }
  return value;
}

function fromSnapshot(id: string, data: Record<string, unknown>): Announcement {
  return {
    ...(data as unknown as Announcement),
    id,
    publishedAt: toDate(data.publishedAt),
    expiresAt: toDate(data.expiresAt) ?? null,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function getAnnouncements(options?: { role?: string; uid?: string }): Promise<Announcement[]> {
  const source = options?.role === "tutor" && options.uid
    ? query(collection(db, COLLECTION), where("createdByUid", "==", options.uid), orderBy("createdAt", "desc"))
    : query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(source);
  return snapshot.docs.map((item) => fromSnapshot(item.id, item.data()));
}

export async function createAnnouncement(
  announcement: NewAnnouncement
): Promise<string> {
  const reference = await addDoc(collection(db, COLLECTION), clean({
    ...announcement,
    publishedAt: announcement.isPublished ? serverTimestamp() : null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return reference.id;
}

export async function updateAnnouncement(
  announcementId: string,
  updates: Partial<Announcement>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, announcementId), clean({
    ...updates,
    updatedAt: serverTimestamp(),
  }));
}

export async function deleteAnnouncement(announcementId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, announcementId));
}
