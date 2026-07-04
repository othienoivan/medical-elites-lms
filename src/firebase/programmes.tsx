import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Programme } from "../models/Programme";

const COLLECTION = "programmes";

export async function createProgramme(programme: Programme) {
  await addDoc(collection(db, COLLECTION), programme);
}

export async function getProgrammes(): Promise<Programme[]> {
  const q = query(
    collection(db, COLLECTION),
    where("published", "==", true),
    orderBy("title")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Programme, "id">),
  }));
}