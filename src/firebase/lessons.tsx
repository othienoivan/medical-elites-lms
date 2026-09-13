import {
  collection,
  deleteDoc,
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

/**
 * Lesson blocks are persisted inside a Firestore array. Firestore rejects
 * unsupported browser entities and nested arrays inside array members. Keep
 * the persisted block schema deliberately plain while preserving HTML/CSS as
 * an ordinary string.
 */
function firestoreSafeMetadata(value: unknown): unknown {
  if (value === undefined) return undefined;
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return JSON.stringify(value);
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, firestoreSafeMetadata(item)])
    );
  }
  return String(value);
}

function firestoreSafeLessonBlocks(blocks: unknown): unknown[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.map((raw) => {
    const block = (raw ?? {}) as Record<string, unknown>;
    const safe: Record<string, unknown> = {
      id: String(block.id ?? ""),
      type: String(block.type ?? "richtext"),
    };
    for (const key of ["title", "content", "url"] as const) {
      if (typeof block[key] === "string") safe[key] = block[key];
    }
    if (block.metadata && typeof block.metadata === "object") {
      safe.metadata = firestoreSafeMetadata(block.metadata);
    }
    return safe;
  });
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
      ? [
          getDocs(
            query(
              collection(db, COLLECTION),
              ...filters,
              where("isPublished", "==", true)
            )
          ),
          getDocs(
            query(
              collection(db, COLLECTION),
              ...filters,
              where("published", "==", true)
            )
          ),
        ]
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
  return dedupe(rows).filter((lesson) =>
    includeUnpublished
    || lesson.isPublished === true
    || lesson.published === true
  );
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
  const safePayload: Record<string, unknown> = { ...payload };
  if (Object.prototype.hasOwnProperty.call(payload, "blocks")) {
    safePayload.blocks = firestoreSafeLessonBlocks(payload.blocks);
  }
  await updateDoc(doc(db, COLLECTION, id), removeUndefined({ ...safePayload, updatedAt: serverTimestamp() }));
}


export async function deleteLesson(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function renameLesson(id: string, title: string): Promise<void> {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error("Lesson title is required.");
  await updateLesson(id, { title: cleanTitle });
}

export async function moveLessonToModule(
  lessonId: string,
  target: {
    id: string;
    title: string;
    courseUnitId?: string;
    courseId?: string;
    courseUnitTitle?: string;
    programmeId?: string;
    programmeTitle?: string;
  },
  scope: AccessScope
): Promise<void> {
  const existing = await getLessons(target.id, scope, true);
  const nextOrder = existing.reduce((max, lesson) => Math.max(max, Number(lesson.order || 0)), 0) + 1;
  await updateLesson(lessonId, {
    moduleId: target.id,
    moduleTitle: target.title,
    courseUnitId: target.courseUnitId ?? target.courseId,
    courseId: target.courseId ?? target.courseUnitId,
    courseUnitTitle: target.courseUnitTitle,
    programmeId: target.programmeId,
    programmeTitle: target.programmeTitle,
    order: nextOrder,
  });
}
