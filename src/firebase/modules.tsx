import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Module } from "../models/Module";

const COLLECTION = "modules";

/**
 * Create Module
 */
export async function createModule(module: Module): Promise<string> {
  // Create the document
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...module,
    id: "",
  });

  // Save the Firestore document ID into the document
  await updateDoc(doc(db, COLLECTION, docRef.id), {
    id: docRef.id,
  });

  return docRef.id;
}

/**
 * Get all published modules
 */
export async function getModules(): Promise<Module[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs
    .map((docSnap) => ({
      ...(docSnap.data() as Omit<Module, "id">),

      // Always use the Firestore document ID
      id: docSnap.id,
    }))
    .filter((module) => module.published === true)
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }

      return a.title.localeCompare(b.title);
    });
}

/**
 * Update Module
 */
export async function updateModule(
  id: string,
  data: Partial<Module>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), data);
}

/**
 * Delete Module
 */
export async function deleteModule(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}