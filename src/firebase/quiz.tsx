import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Quiz } from "../models/Quiz";

const QUIZ_COLLECTION = "quizzes";
const ATTEMPT_COLLECTION = "quizAttempts";

/**
 * Creates a quiz
 */
export async function createQuiz(quiz: Quiz) {
  await addDoc(collection(db, QUIZ_COLLECTION), quiz);
}

/**
 * Gets a quiz for a module
 */
export async function getQuizByModuleId(
  moduleId: string
): Promise<Quiz | null> {
  const q = query(
    collection(db, QUIZ_COLLECTION),
    where("moduleId", "==", moduleId)
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const quizDoc = snapshot.docs[0];

  return {
    id: quizDoc.id,
    ...(quizDoc.data() as Omit<Quiz, "id">),
  };
}

/**
 * Saves a student's quiz attempt
 */
export async function saveQuizAttempt({
  userId,
  courseId,
  moduleId,
  quizId,
  score,
  passMark,
}: {
  userId: string;
  courseId: string;
  moduleId: string;
  quizId: string;
  score: number;
  passMark: number;
}) {
  const passed = score >= passMark;

  const attemptId = `${userId}_${quizId}_${Date.now()}`;

  await setDoc(doc(collection(db, ATTEMPT_COLLECTION), attemptId), {
    id: attemptId,
    userId,
    courseId,
    moduleId,
    quizId,
    score,
    passMark,
    passed,
    createdAt: serverTimestamp(),
  });

  return {
    passed,
    attemptId,
  };
}