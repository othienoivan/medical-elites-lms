import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Lesson } from "../models/Lesson";
import { requireAccessScope, type AccessScope } from "./accessScope";

const COLLECTION = "lessons";

function fromDoc(id: string, data: Record<string, unknown>): Lesson {
  return { ...(data as unknown as Omit<Lesson, "id">), id };
}

function dedupe(rows: Lesson[]): Lesson[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()].sort(
    (a, b) => a.order - b.order || a.title.localeCompare(b.title)
  );
}

function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) return value.map(removeUndefined) as T;
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefined(item)])
    ) as T;
  }
  return value;
}

export async function createLesson(lesson: Lesson): Promise<string> {
  const { id: _id, ...payload } = lesson;
  void _id;
  const ownerUid = payload.ownerUserId ?? payload.createdByUid;
  if (!ownerUid) throw new Error("Lesson owner is missing. Please sign out and sign in again.");

  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, removeUndefined({
    ...payload,
    id: ref.id,
    ownerUserId: ownerUid,
    createdByUid: payload.createdByUid ?? ownerUid,
    assignedTutorIds: payload.assignedTutorIds?.length ? payload.assignedTutorIds : [ownerUid],
    institutionId: payload.institutionId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return ref.id;
}

export async function getLessons(
  moduleId: string,
  scope: AccessScope,
  includeUnpublished = false
): Promise<Lesson[]> {
  const access = requireAccessScope(scope);
  const filters = [where("moduleId", "==", moduleId)];
  const requests = access.role === "admin" && access.institutionId
    ? [getDocs(query(collection(db, COLLECTION), ...filters, where("institutionId", "==", access.institutionId)))]
    : access.role === "student"
      ? [getDocs(query(collection(db, COLLECTION), ...filters, where("isPublished", "==", true)))]
      : [
          getDocs(query(collection(db, COLLECTION), ...filters, where("ownerUserId", "==", access.uid))),
          getDocs(query(collection(db, COLLECTION), ...filters, where("createdByUid", "==", access.uid))),
          getDocs(query(collection(db, COLLECTION), ...filters, where("assignedTutorIds", "array-contains", access.uid))),
        ];

  const results = await Promise.allSettled(requests);
  const rows = results.flatMap((result) =>
    result.status === "fulfilled"
      ? result.value.docs.map((item) => fromDoc(item.id, item.data()))
      : []
  );
  if (rows.length === 0 && results.every((result) => result.status === "rejected")) {
    throw results[0].status === "rejected" ? results[0].reason : new Error("Unable to load lessons.");
  }
  return dedupe(rows).filter((lesson) => includeUnpublished || lesson.isPublished === true);
}

export async function getLessonsByModule(moduleId: string, scope: AccessScope): Promise<Lesson[]> {
  return getLessons(moduleId, scope);
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));
  return snapshot.exists() ? fromDoc(snapshot.id, snapshot.data()) : null;
}

export async function updateLesson(id: string, data: Partial<Lesson>): Promise<void> {
  const { id: _id, ...payload } = data;
  void _id;
  await updateDoc(doc(db, COLLECTION, id), removeUndefined({ ...payload, updatedAt: serverTimestamp() }));
}
