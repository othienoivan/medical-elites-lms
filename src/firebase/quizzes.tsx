import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { httpsCallable } from "firebase/functions";
import { auth, db, functions } from "../config/firebase";
import type { Quiz, QuizQuestionRef } from "../models/Quiz";
import { requireAccessScope, type AccessScope } from "./accessScope";

const COLLECTION = "quizzes";

function removeUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedValues(item)) as T;
  }

  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefinedValues(item)])
    ) as T;
  }

  return value;
}


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

async function syncQuizPlacement(quizId: string, next: Partial<Quiz>, previous?: Quiz | null) {
  const previousLessonId = previous?.lessonId;
  const previousModuleId = previous?.moduleId;
  if (previousLessonId && previousLessonId !== next.lessonId) {
    const ref = doc(db, "lessons", previousLessonId);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().quizId === quizId) await updateDoc(ref, { quizId: null, updatedAt: serverTimestamp() });
  }
  if (previousModuleId && previousModuleId !== next.moduleId && !previousLessonId) {
    const ref = doc(db, "modules", previousModuleId);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().quizId === quizId) await updateDoc(ref, { quizId: null, updatedAt: serverTimestamp() });
  }
  if (next.lessonId) {
    await updateDoc(doc(db, "lessons", next.lessonId), { quizId, quizRequired: true, updatedAt: serverTimestamp() });
  } else if (next.moduleId) {
    await updateDoc(doc(db, "modules", next.moduleId), { quizId, quizRequired: true, updatedAt: serverTimestamp() });
  }
}

export async function createQuiz(quiz: Quiz): Promise<string> {
  await validateQuizQuestions(quiz.questions);

  const user = auth.currentUser;
  if (!user) {
    throw new Error("You must be signed in to create an assessment.");
  }

  const payload = removeUndefinedValues({
    ...quiz,
    id: "",
    ownerUserId: user.uid,
    createdBy: user.uid,
    createdByUid: user.uid,
    assignedTutorIds: Array.from(
      new Set([user.uid, ...((quiz as Quiz & { assignedTutorIds?: string[] }).assignedTutorIds || [])])
    ),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  const docRef = await addDoc(collection(db, COLLECTION), payload);
  await syncQuizPlacement(docRef.id, quiz);
  return docRef.id;
}

export async function getQuizzes(scope: AccessScope): Promise<Quiz[]> {
  const access = requireAccessScope(scope);

  const toQuiz = (docSnap: { id: string; data: () => unknown }) => ({
    ...(docSnap.data() as Omit<Quiz, "id">),
    id: docSnap.id,
  });

  if (access.role === "student") {
    const assignedIds = [...new Set(access.assignedCourseUnitIds ?? [])];
    if (assignedIds.length === 0) return [];

    const chunks: string[][] = [];
    for (let index = 0; index < assignedIds.length; index += 10) {
      chunks.push(assignedIds.slice(index, index + 10));
    }

    const results = await Promise.all(
      chunks.map((ids) =>
        getDocs(
          query(
            collection(db, COLLECTION),
            where("courseUnitId", "in", ids),
            where("status", "==", "published")
          )
        )
      )
    );

    return [...new Map(results.flatMap((snapshot) => snapshot.docs.map(toQuiz)).map((quiz) => [quiz.id, quiz])).values()]
      .sort((a, b) => a.title.localeCompare(b.title));
  }

  const queries = [
    query(collection(db, COLLECTION), where("ownerUserId", "==", access.uid)),
    query(collection(db, COLLECTION), where("assignedTutorIds", "array-contains", access.uid)),
  ];

  if (access.role === "admin" && access.institutionId) {
    queries.push(query(collection(db, COLLECTION), where("institutionId", "==", access.institutionId)));
  }

  const snapshots = await Promise.all(queries.map((quizQuery) => getDocs(quizQuery)));
  return [...new Map(snapshots.flatMap((snapshot) => snapshot.docs.map(toQuiz)).map((quiz) => [quiz.id, quiz])).values()]
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
  const previous = await getQuizById(id);
  if (data.questions !== undefined) {
    await validateQuizQuestions(data.questions);
  }

  await updateDoc(
    doc(db, COLLECTION, id),
    removeUndefinedValues({
      ...data,
      updatedAt: serverTimestamp(),
    })
  );
  await syncQuizPlacement(id, { ...previous, ...data }, previous);
}

export async function deleteQuiz(id: string): Promise<void> {
  const callable = httpsCallable<{ quizId: string }, { success: boolean }>(functions, "permanentlyDeleteQuizTrusted");
  await callable({ quizId: id });
}
