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
  writeBatch,
} from "firebase/firestore";

import { httpsCallable } from "firebase/functions";
import { db, functions } from "../config/firebase";
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

function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(removeUndefined) as T;
  }

  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    const isPlainObject = prototype === Object.prototype || prototype === null;
    if (!isPlainObject) return value;

    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, removeUndefined(item)])
    ) as T;
  }

  return value;
}

export async function createQuestion(question: Question) {
  const questionData: Partial<Question> = { ...question };
  delete questionData.id;
  const document = await addDoc(
    collection(db, COLLECTION),
    removeUndefined({
      ...questionData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  );
  return document.id;
}

export async function updateQuestion(questionId: string, data: Partial<Question>) {
  await updateDoc(
    doc(db, COLLECTION, questionId),
    removeUndefined({ ...data, updatedAt: serverTimestamp() })
  );
}

export async function deleteQuestion(questionId: string, deletedBy?: string) {
  await updateDoc(doc(db, COLLECTION, questionId), {
    isDeleted: true,
    isPublished: false,
    deletedBy: deletedBy ?? null,
    deletedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function permanentlyDeleteQuestion(questionId: string) {
  const callable = httpsCallable<{ questionId: string }, { success: boolean; removedFromQuizzes: number; removedFromExaminations: number }>(functions, "permanentlyDeleteQuestionTrusted");
  const result = await callable({ questionId });
  return result.data;
}

export async function restoreQuestion(questionId: string) {
  await updateDoc(doc(db, COLLECTION, questionId), {
    isDeleted: false,
    deletedBy: null,
    deletedAt: null,
    updatedAt: serverTimestamp(),
  });
}

export async function duplicateQuestion(question: Question, ownerUserId: string) {
  const copy: Question = {
    ...question,
    id: "",
    questionText: `${question.questionText} (Copy)`,
    ownerUserId,
    createdBy: ownerUserId,
    createdByUid: ownerUserId,
    assignedTutorIds: [ownerUserId],
    isDeleted: false,
    isPublished: false,
    usageCount: 0,
  };
  return createQuestion(copy);
}

export async function bulkCreateQuestions(questions: Question[]) {
  const batch = writeBatch(db);
  const ids: string[] = [];
  questions.forEach((question) => {
    const ref = doc(collection(db, COLLECTION));
    ids.push(ref.id);
    const data: Partial<Question> = { ...question };
    delete data.id;
    batch.set(
      ref,
      removeUndefined({
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    );
  });
  await batch.commit();
  return ids;
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
    return snapshot.docs.map((item) => fromDoc(item.id, item.data())).filter((item) => !item.isDeleted);
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
  ]).filter((item) => !item.isDeleted);
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
