import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Lesson } from "../models/Lesson";

const COLLECTION = "lessons";

/**
 * Create a lesson
 */
export async function createLesson(lesson: Lesson) {
  await addDoc(collection(db, COLLECTION), lesson);
}

/**
 * Get all published lessons for a module
 */
export async function getLessons(moduleId: string): Promise<Lesson[]> {
  const q = query(
    collection(db, COLLECTION),
    where("moduleId", "==", moduleId),
    where("published", "==", true),
    orderBy("order")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Lesson, "id">),
  }));
}