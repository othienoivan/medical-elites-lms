import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Module } from "../models/Module";

const COLLECTION = "modules";

export async function createModule(module: Module) {
  await addDoc(collection(db, COLLECTION), module);
}

export async function getModules(courseId: string): Promise<Module[]> {
  const q = query(
    collection(db, COLLECTION),
    where("courseId", "==", courseId),
    where("published", "==", true),
    orderBy("order")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Module, "id">),
  }));
}