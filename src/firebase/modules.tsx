import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Module } from "../models/Module";

const COLLECTION = "modules";

/**
 * Create Module
 */
export async function createModule(module: Module) {
  await addDoc(collection(db, COLLECTION), module);
}

/**
 * Get all published modules
 */
export async function getModules(): Promise<Module[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy("order"),
    orderBy("title")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Module, "id">),
    }))
    .filter((module) => module.published);
}

/**
 * Update Module
 */
export async function updateModule(
  id: string,
  data: Partial<Module>
) {
  await updateDoc(doc(db, COLLECTION, id), data);
}

/**
 * Delete Module
 */
export async function deleteModule(id: string) {
  await deleteDoc(doc(db, COLLECTION, id));
}