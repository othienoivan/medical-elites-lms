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
import type { Quiz, QuizQuestionRef } from "../models/Quiz";

const COLLECTION = "quizzes";

function validateQuestionReferences(questions: QuizQuestionRef[] | undefined) {
  const validReferences = (questions || []).filter(
    (item) =>
      typeof item.questionId === "string" &&
      item.questionId.trim().length > 0 &&
      Number.isFinite(item.marks) &&
      item.marks > 0
  );

  if (validReferences.length === 0) {
    throw new Error(
      "A quiz must contain at least one valid question with marks greater than zero."
    );
  }

  if (validReferences.length !== questions?.length) {
    throw new Error(
      "One or more selected questions are invalid. Remove them and select valid questions from the Question Bank."
    );
  }

  return validReferences;
}

async function assertQuestionDocumentsExist(questions: QuizQuestionRef[]) {
  const uniqueQuestionIds = [
    ...new Set(questions.map((item) => item.questionId.trim())),
  ];

  const snapshots = await Promise.all(
    uniqueQuestionIds.map((questionId) =>
      getDoc(doc(db, "questions", questionId))
    )
  );

  const missing = snapshots
    .filter((snapshot) => !snapshot.exists())
    .map((_, index) => uniqueQuestionIds[index]);

  if (missing.length > 0) {
    throw new Error(
      "One or more selected questions no longer exist in the Question Bank. Remove the missing questions before saving."
    );
  }
}

async function validateQuizQuestions(questions: QuizQuestionRef[] | undefined) {
  const validReferences = validateQuestionReferences(questions);
  await assertQuestionDocumentsExist(validReferences);
}

export async function createQuiz(quiz: Quiz): Promise<string> {
  await validateQuizQuestions(quiz.questions);

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
  if (data.questions !== undefined) {
    await validateQuizQuestions(data.questions);
  }

  await updateDoc(doc(db, COLLECTION, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteQuiz(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}
