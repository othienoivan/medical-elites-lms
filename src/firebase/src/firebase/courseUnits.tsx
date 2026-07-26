import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { CourseUnit } from "../models/CourseUnit";
import { requireAccessScope, type AccessScope } from "./accessScope";
import { getAllProgrammes } from "./programmes";

const COLLECTION = "courses";

function fromDoc(id: string, data: Record<string, unknown>): CourseUnit {
  return { ...(data as unknown as Omit<CourseUnit, "id">), id };
}

function dedupe(rows: CourseUnit[]): CourseUnit[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()].sort((a, b) => a.title.localeCompare(b.title));
}

function removeUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => item !== undefined)
  ) as T;
}

export async function createCourseUnit(courseUnit: CourseUnit): Promise<string> {
  const { id: _id, ...payload } = courseUnit;
  void _id;
  const docRef = await addDoc(collection(db, COLLECTION), removeUndefined({
    ...payload,
    institutionId: payload.institutionId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  await updateDoc(doc(db, COLLECTION, docRef.id), { id: docRef.id });
  return docRef.id;
}

export async function getAllCourseUnits(scope: AccessScope): Promise<CourseUnit[]> {
  const access = requireAccessScope(scope);

  if (access.role === "student") {
    const ids = access.assignedCourseUnitIds ?? [];
    const snapshots = await Promise.all(ids.map((id) => getDoc(doc(db, COLLECTION, id))));
    return dedupe(snapshots.filter((item) => item.exists()).map((item) => fromDoc(item.id, item.data()!)));
  }

  if (access.role === "admin" && access.institutionId) {
    const snapshot = await getDocs(query(collection(db, COLLECTION), where("institutionId", "==", access.institutionId)));
    return dedupe(snapshot.docs.map((item) => fromDoc(item.id, item.data())));
  }

  const visibleProgrammeIds = (await getAllProgrammes(access)).map((item) => item.id);
  const programmeQueries = visibleProgrammeIds.map((programmeId) =>
    getDocs(query(collection(db, COLLECTION), where("programmeId", "==", programmeId)))
  );
  const results = await Promise.allSettled([
    getDocs(query(collection(db, COLLECTION), where("ownerUserId", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("createdByUid", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("createdBy", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("assignedTutorIds", "array-contains", access.uid))),
    ...programmeQueries,
  ]);

  const rows = results.flatMap((result, index) => {
    if (result.status === "fulfilled") {
      return result.value.docs.map((item) => fromDoc(item.id, item.data()));
    }

    console.warn(`Course-unit ownership query ${index + 1} failed and was skipped:`, result.reason);
    return [];
  });

  if (rows.length === 0 && results.every((result) => result.status === "rejected")) {
    throw results[0].status === "rejected" ? results[0].reason : new Error("Unable to load course units.");
  }

  return dedupe(rows);
}

export async function getCourseUnits(scope: AccessScope): Promise<CourseUnit[]> {
  return (await getAllCourseUnits(scope)).filter((courseUnit) => courseUnit.published === true);
}

export async function updateCourseUnit(id: string, data: Partial<CourseUnit>): Promise<void> {
  const { id: _id, ...payload } = data;
  void _id;
  await updateDoc(
    doc(db, COLLECTION, id),
    removeUndefined({ ...payload, updatedAt: serverTimestamp() })
  );
}

async function getManagedLinkedDocuments(
  collectionName: "modules" | "lessons",
  courseUnitId: string,
  scope: AccessScope
) {
  const access = requireAccessScope(scope);
  const base = collection(db, collectionName);
  const queries = access.role === "admin" && access.institutionId
    ? [query(base, where("courseUnitId", "==", courseUnitId), where("institutionId", "==", access.institutionId))]
    : [
        query(base, where("courseUnitId", "==", courseUnitId), where("ownerUserId", "==", access.uid)),
        query(base, where("courseUnitId", "==", courseUnitId), where("createdByUid", "==", access.uid)),
        query(base, where("courseUnitId", "==", courseUnitId), where("assignedTutorIds", "array-contains", access.uid)),
      ];

  const results = await Promise.allSettled(queries.map((item) => getDocs(item)));
  const documents = results.flatMap((result) => result.status === "fulfilled" ? result.value.docs : []);
  return [...new Map(documents.map((item) => [item.id, item])).values()];
}

export async function countCourseUnitModules(courseUnitId: string, scope: AccessScope): Promise<number> {
  return (await getManagedLinkedDocuments("modules", courseUnitId, scope)).length;
}

export async function deleteCourseUnit(id: string, scope: AccessScope): Promise<void> {
  const linked = await countCourseUnitModules(id, scope);
  if (linked > 0) throw new Error(`This course unit has ${linked} linked module${linked === 1 ? "" : "s"}. Merge it or remove its modules first.`);
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function mergeCourseUnits(sourceId: string, targetId: string, scope: AccessScope): Promise<void> {
  if (sourceId === targetId) throw new Error("Choose two different course units.");
  const [sourceSnap, targetSnap] = await Promise.all([
    getDoc(doc(db, COLLECTION, sourceId)),
    getDoc(doc(db, COLLECTION, targetId)),
  ]);
  if (!sourceSnap.exists() || !targetSnap.exists()) throw new Error("One of the selected course units no longer exists.");

  const [moduleDocs, lessonDocs] = await Promise.all([
    getManagedLinkedDocuments("modules", sourceId, scope),
    getManagedLinkedDocuments("lessons", sourceId, scope),
  ]);
  const target = targetSnap.data() as Record<string, unknown>;
  const batch = writeBatch(db);
  moduleDocs.forEach((item) => batch.update(item.ref, {
    courseUnitId: targetId,
    courseId: targetId,
    courseUnitTitle: target.title ?? "",
    programmeId: target.programmeId ?? null,
    programmeTitle: target.programmeTitle ?? "",
    updatedAt: serverTimestamp(),
  }));
  lessonDocs.forEach((item) => batch.update(item.ref, {
    courseUnitId: targetId,
    courseUnitTitle: target.title ?? "",
    programmeId: target.programmeId ?? null,
    programmeTitle: target.programmeTitle ?? "",
    updatedAt: serverTimestamp(),
  }));
  batch.delete(sourceSnap.ref);
  await batch.commit();
}
