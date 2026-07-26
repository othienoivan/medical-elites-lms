import { collection, deleteDoc, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";
import type { Module } from "../models/Module";
import { requireAccessScope, type AccessScope } from "./accessScope";
import { getAllProgrammes } from "./programmes";

const COLLECTION = "modules";
function fromDoc(id: string, data: Record<string, unknown>): Module { return { ...(data as unknown as Omit<Module, "id">), id }; }
function dedupe(rows: Module[]): Module[] { return [...new Map(rows.map((row) => [row.id, row])).values()].sort((a,b)=>a.order-b.order || a.title.localeCompare(b.title)); }

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

export async function createModule(module: Module): Promise<string> {
  const { id: _id, ...payload } = module; void _id;
  const ref = doc(collection(db, COLLECTION));
  await setDoc(ref, removeUndefined({
    ...payload,
    id: ref.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));
  return ref.id;
}

export async function getAllModules(scope: AccessScope): Promise<Module[]> {
  const access = requireAccessScope(scope);

  if (access.role === "student") {
    const assignedIds = [...new Set(access.assignedCourseUnitIds ?? [])];
    if (assignedIds.length === 0) return [];

    const chunks: string[][] = [];
    for (let index = 0; index < assignedIds.length; index += 10) {
      chunks.push(assignedIds.slice(index, index + 10));
    }

    const results = await Promise.allSettled(
      chunks.flatMap((ids) => [
        getDocs(query(collection(db, COLLECTION), where("courseUnitId", "in", ids))),
        getDocs(query(collection(db, COLLECTION), where("courseId", "in", ids))),
      ])
    );

    return dedupe(
      results.flatMap((result) =>
        result.status === "fulfilled"
          ? result.value.docs.map((item) => fromDoc(item.id, item.data()))
          : []
      )
    );
  }

  if (access.role === "admin" && access.institutionId) {
    const snap = await getDocs(query(collection(db, COLLECTION), where("institutionId", "==", access.institutionId)));
    return dedupe(snap.docs.map((d)=>fromDoc(d.id,d.data())));
  }
  const programmeIds = (await getAllProgrammes(access)).map((p)=>p.id);
  const programmeQueries = programmeIds.length
    ? [getDocs(query(collection(db, COLLECTION), where("programmeId", "in", programmeIds.slice(0, 10))))]
    : [];

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
    // Optional legacy/shared-record queries must never hide successfully loaded owned modules.
    console.warn(`Module visibility query ${index + 1} failed and was skipped:`, result.reason);
    return [];
  });

  if (rows.length === 0 && results.every((result) => result.status === "rejected")) {
    throw results[0].status === "rejected" ? results[0].reason : new Error("Unable to load modules.");
  }

  return dedupe(rows);
}
export async function getModules(scope: AccessScope): Promise<Module[]> { return (await getAllModules(scope)).filter((m)=>m.published); }
export async function updateModule(id: string, data: Partial<Module>): Promise<void> { await updateDoc(doc(db,COLLECTION,id), {...data, updatedAt: serverTimestamp()}); }
export async function deleteModule(id: string): Promise<void> { await deleteDoc(doc(db,COLLECTION,id)); }

export async function getModuleById(id: string): Promise<Module | null> { const snap = await getDoc(doc(db,COLLECTION,id)); return snap.exists() ? fromDoc(snap.id,snap.data()) : null; }
