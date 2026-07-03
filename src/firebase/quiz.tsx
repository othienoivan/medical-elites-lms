import {
  collection,
  doc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";

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

  await setDoc(doc(collection(db, "quizAttempts"), attemptId), {
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