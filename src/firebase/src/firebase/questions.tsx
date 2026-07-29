import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Question } from "../models/Question";
import { requireAccessScope, type AccessScope } from "./accessScope";
import { getAllProgrammes } from "./programmes";

const COLLECTION = "questions";

function fromDoc(id: string, data: Record<string, unknown>): Question {
  return { ...(data as unknown as Omit<Question, "id">), id };
}

function dedupe(rows: Question[]): Question[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

export async function createQuestion(question: Question) {
  const questionData: Partial<Question> = { ...question };
  delete questionData.id;
  const document = await addDoc(collection(db, COLLECTION), {
    ...questionData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return document.id;
}

export async function updateQuestion(questionId: string, data: Partial<Question>) {
  await updateDoc(doc(db, COLLECTION, questionId), { ...data, updatedAt: serverTimestamp() });
}

export async function deleteQuestion(questionId: string) {
  await deleteDoc(doc(db, COLLECTION, questionId));
}

export async function getQuestionById(questionId: string): Promise<Question | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, questionId));
  return snapshot.exists() ? fromDoc(snapshot.id, snapshot.data()) : null;
}

export async function getQuestions(scope: AccessScope): Promise<Question[]> {
  const access = requireAccessScope(scope);
  if (access.role === "student") return [];

  if (access.role === "admin" && access.institutionId) {
    const snapshot = await getDocs(query(collection(db, COLLECTION), where("institutionId", "==", access.institutionId)));
    return snapshot.docs.map((item) => fromDoc(item.id, item.data()));
  }

  const visibleProgrammeIds = (await getAllProgrammes(access)).map((item) => item.id);
  const programmeQueries = visibleProgrammeIds.length > 0
    ? [getDocs(query(collection(db, COLLECTION), where("programmeId", "in", visibleProgrammeIds.slice(0, 10))))]
    : [];
  const [owned, assigned, ...byProgramme] = await Promise.all([
    getDocs(query(collection(db, COLLECTION), where("ownerUserId", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("assignedTutorIds", "array-contains", access.uid))),
    ...programmeQueries,
  ]);
  return dedupe([
    ...owned.docs.map((item) => fromDoc(item.id, item.data())),
    ...assigned.docs.map((item) => fromDoc(item.id, item.data())),
    ...byProgramme.flatMap((snapshot) => snapshot.docs.map((item) => fromDoc(item.id, item.data()))),
  ]);
}

export async function getQuestionsByModule(moduleId: string, scope: AccessScope): Promise<Question[]> {
  return (await getQuestions(scope)).filter((question) => question.moduleId === moduleId);
}

export async function getQuestionsByCourseUnit(courseUnitId: string, scope: AccessScope): Promise<Question[]> {
  return (await getQuestions(scope)).filter((question) => question.courseUnitId === courseUnitId);
}

export async function getQuestionsByProgramme(programmeId: string, scope: AccessScope): Promise<Question[]> {
  return (await getQuestions(scope)).filter((question) => question.programmeId === programmeId);
}

export async function searchQuestions(keyword: string, scope: AccessScope): Promise<Question[]> {
  const search = keyword.toLowerCase();
  return (await getQuestions(scope)).filter((question) =>
    question.questionText.toLowerCase().includes(search) ||
    question.topic.toLowerCase().includes(search) ||
    question.tags.some((tag) => tag.toLowerCase().includes(search))
  );
}
