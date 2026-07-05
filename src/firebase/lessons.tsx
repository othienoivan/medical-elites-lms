import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
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
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs
    .map((docSnap) => ({
      ...(docSnap.data() as Omit<Lesson, "id">),
      id: docSnap.id,
    }))
    .filter((lesson) => lesson.moduleId === moduleId)
    .filter((lesson) => lesson.isPublished === true)
    .sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }

      return a.title.localeCompare(b.title);
    });
}

export async function getLessonById(id: string): Promise<Lesson | null> {
  const lessonRef = doc(db, COLLECTION, id);
  const snapshot = await getDoc(lessonRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...(snapshot.data() as Omit<Lesson, "id">),
    id: snapshot.id,
  };
}

export async function updateLesson(
  id: string,
  data: Partial<Lesson>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: new Date(),
  });
}