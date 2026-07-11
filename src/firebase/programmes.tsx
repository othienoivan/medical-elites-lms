import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Programme } from "../models/Programme";

const COLLECTION = "programmes";

export async function createProgramme(programme: Programme): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...programme,
    id: "",
  });

  await updateDoc(doc(db, COLLECTION, docRef.id), {
    id: docRef.id,
  });

  return docRef.id;
}

export async function getProgrammes(): Promise<Programme[]> {
  const q = query(collection(db, COLLECTION), orderBy("title"));

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnap) => ({
      ...(docSnap.data() as Omit<Programme, "id">),
      id: docSnap.id,
    }))
    .filter((programme) => programme.published === true);
}