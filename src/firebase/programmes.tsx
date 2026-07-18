import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Programme } from "../models/Programme";

const COLLECTION = "programmes";

export async function createProgramme(programme: Programme): Promise<string> {
  const { id: _id, ...payload } = programme;
  void _id;
  const docRef = await addDoc(collection(db, COLLECTION), payload);
  await updateDoc(doc(db, COLLECTION, docRef.id), { id: docRef.id });
  return docRef.id;
}

export async function getAllProgrammes(): Promise<Programme[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy("title")));
  return snapshot.docs.map((item) => ({ ...(item.data() as Omit<Programme, "id">), id: item.id }));
}

export async function getProgrammes(): Promise<Programme[]> {
  return (await getAllProgrammes()).filter((programme) => programme.published === true);
}

export async function updateProgramme(id: string, data: Partial<Programme>): Promise<void> {
  const { id: _id, ...payload } = data;
  void _id;
  await updateDoc(doc(db, COLLECTION, id), { ...payload, updatedAt: new Date() });
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
