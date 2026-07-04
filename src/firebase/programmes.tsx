import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Programme } from "../models/Programme";

const COLLECTION = "programmes";

/**
 * Create a new programme
 */
export async function createProgramme(programme: Programme) {
  await addDoc(collection(db, COLLECTION), programme);
}

/**
 * Get all published programmes
 */
export async function getProgrammes(): Promise<Programme[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy("title")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Programme, "id">),
    }))
    .filter((programme) => programme.published);
}