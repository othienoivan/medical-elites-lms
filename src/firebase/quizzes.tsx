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
import type { Quiz } from "../models/Quiz";

const COLLECTION = "quizzes";

export async function createQuiz(quiz: Quiz): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...quiz,
    id: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, COLLECTION, docRef.id), {
    id: docRef.id,
  });

  return docRef.id;
}

export async function getQuizzes(): Promise<Quiz[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs
    .map((docSnap) => ({
      ...(docSnap.data() as Omit<Quiz, "id">),
      id: docSnap.id,
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
}

export async function getQuizById(id: string): Promise<Quiz | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...(snapshot.data() as Omit<Quiz, "id">),
    id: snapshot.id,
  };
}

export async function updateQuiz(
  id: string,
  data: Partial<Quiz>
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteQuiz(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}