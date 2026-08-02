import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Programme } from "../models/Programme";
import { requireAccessScope, type AccessScope } from "./accessScope";

const COLLECTION = "programmes";

function fromDoc(id: string, data: Record<string, unknown>): Programme {
  return { ...(data as unknown as Omit<Programme, "id">), id };
}

function dedupe(rows: Programme[]): Programme[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()].sort((a, b) => a.title.localeCompare(b.title));
}

export async function createProgramme(programme: Programme): Promise<string> {
  const { id: _id, ...payload } = programme;
  void _id;
  const ownerUid = payload.ownerUserId ?? payload.createdByUid ?? payload.createdBy;
  if (!ownerUid) throw new Error("Programme owner is missing. Please sign out and sign in again.");

  const docRef = doc(collection(db, COLLECTION));
  await setDoc(docRef, {
    ...payload,
    id: docRef.id,
    createdBy: payload.createdBy ?? ownerUid,
    ownerUserId: ownerUid,
    createdByUid: payload.createdByUid ?? ownerUid,
    assignedTutorIds: payload.assignedTutorIds?.length ? payload.assignedTutorIds : [ownerUid],
    institutionId: payload.institutionId ?? null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllProgrammes(scope: AccessScope): Promise<Programme[]> {
  const access = requireAccessScope(scope);

  if (access.role === "student") {
    const ids = access.programmeIds ?? [];
    const snapshots = await Promise.all(ids.map((id) => getDoc(doc(db, COLLECTION, id))));
    return dedupe(snapshots.filter((item) => item.exists()).map((item) => fromDoc(item.id, item.data()!)));
  }

  if (access.role === "admin" && access.institutionId) {
    const snapshot = await getDocs(query(collection(db, COLLECTION), where("institutionId", "==", access.institutionId), orderBy("title")));
    return snapshot.docs.map((item) => fromDoc(item.id, item.data()));
  }

  const results = await Promise.allSettled([
    getDocs(query(collection(db, COLLECTION), where("ownerUserId", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("createdBy", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("assignedTutorIds", "array-contains", access.uid))),
  ]);

  const rows = results.flatMap((result) =>
    result.status === "fulfilled"
      ? result.value.docs.map((item) => fromDoc(item.id, item.data()))
      : []
  );

  if (rows.length === 0 && results.every((result) => result.status === "rejected")) {
    throw results[0].status === "rejected" ? results[0].reason : new Error("Unable to load programmes.");
  }

  return dedupe(rows);
}

export async function getProgrammes(scope: AccessScope): Promise<Programme[]> {
  return (await getAllProgrammes(scope)).filter((programme) => programme.published === true);
}

export async function updateProgramme(id: string, data: Partial<Programme>): Promise<void> {
  const { id: _id, ...payload } = data;
  void _id;
  await updateDoc(doc(db, COLLECTION, id), { ...payload, updatedAt: serverTimestamp() });
}

export async function countProgrammeCourseUnits(programmeId: string): Promise<number> {
  const snapshot = await getDocs(query(collection(db, "courses"), where("programmeId", "==", programmeId)));
  return snapshot.size;
}

export async function deleteProgramme(id: string): Promise<void> {
  const linked = await countProgrammeCourseUnits(id);
  if (linked > 0) throw new Error(`This programme has ${linked} linked course unit${linked === 1 ? "" : "s"}. Archive it instead.`);
  await deleteDoc(doc(db, COLLECTION, id));
}

export async function getProgrammeById(id: string): Promise<Programme | null> { const snap = await getDoc(doc(db,COLLECTION,id)); return snap.exists() ? fromDoc(snap.id,snap.data()) : null; }
