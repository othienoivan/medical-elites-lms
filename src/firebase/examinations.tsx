import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Examination } from "../models/Examination";

const COLLECTION = "examinations";

export async function createExamination(
  examination: Examination
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...examination,
    id: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTION, docRef.id), {
    id: docRef.id,
  });

  return docRef.id;
}

export async function getExaminations(): Promise<Examination[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs
    .map((docSnap) => ({
      ...(docSnap.data() as Omit<Examination, "id">),
      id: docSnap.id,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getExaminationById(
  id: string
): Promise<Examination | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...(snapshot.data() as Omit<Examination, "id">),
    id: snapshot.id,
  };
}

export async function updateExamination(
  id: string,
  data: Partial<Examination>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteExamination(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}