import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Lesson } from "../models/Lesson";

const COLLECTION = "lessons";

export async function createLesson(lesson: Lesson): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...lesson,
    id: "",
  });

  await updateDoc(doc(db, COLLECTION, docRef.id), {
    id: docRef.id,
  });

  return docRef.id;
}

export async function getLessons(moduleId: string): Promise<Lesson[]> {
  const q = query(
    collection(db, COLLECTION),
    where("moduleId", "==", moduleId),
    orderBy("order")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnap) => ({
      ...(docSnap.data() as Omit<Lesson, "id">),
      id: docSnap.id,
    }))
    .filter((lesson) => lesson.isPublished === true);
}