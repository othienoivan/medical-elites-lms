import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Question } from "../models/Question";

const COLLECTION = "questions";

/**
 * Create Question
 */
export async function createQuestion(question: Question) {
  const questionData: Partial<Question> = { ...question };
  delete questionData.id;

  const data = {
    ...questionData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const document = await addDoc(collection(db, COLLECTION), data);

  return document.id;
}

/**
 * Update Question
 */
export async function updateQuestion(
  questionId: string,
  data: Partial<Question>
) {
  await updateDoc(doc(db, COLLECTION, questionId), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Delete Question
 */
export async function deleteQuestion(questionId: string) {
  await deleteDoc(doc(db, COLLECTION, questionId));
}

/**
 * Get Question By ID
 */
export async function getQuestionById(
  questionId: string
): Promise<Question | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, questionId));

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Question, "id">),
  };
}

/**
 * Get All Questions
 */
export async function getQuestions(): Promise<Question[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
  );

  return snapshot.docs.map((document) => ({
    ...(document.data() as Omit<Question, "id">),
    id: document.id,
  }));
}

/**
 * Get Questions By Module
 */
export async function getQuestionsByModule(
  moduleId: string
): Promise<Question[]> {
  const allQuestions = await getQuestions();

  return allQuestions.filter(
    (question) => question.moduleId === moduleId
  );
}

/**
 * Get Questions By Course Unit
 */
export async function getQuestionsByCourseUnit(
  courseUnitId: string
): Promise<Question[]> {
  const allQuestions = await getQuestions();

  return allQuestions.filter(
    (question) => question.courseUnitId === courseUnitId
  );
}

/**
 * Get Questions By Programme
 */
export async function getQuestionsByProgramme(
  programmeId: string
): Promise<Question[]> {
  const allQuestions = await getQuestions();

  return allQuestions.filter(
    (question) => question.programmeId === programmeId
  );
}

/**
 * Search Questions
 */
export async function searchQuestions(
  keyword: string
): Promise<Question[]> {
  const allQuestions = await getQuestions();

  const search = keyword.toLowerCase();

  return allQuestions.filter((question) => {
    return (
      question.questionText.toLowerCase().includes(search) ||
      question.topic.toLowerCase().includes(search) ||
      question.tags.some((tag) => tag.toLowerCase().includes(search))
    );
  });
}