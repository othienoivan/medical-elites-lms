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
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import type { ManualMark } from "../models/QuizAttempt";
import { db } from "../config/firebase";
import type { QuizAttempt } from "../models/QuizAttempt";

const COLLECTION = "quizAttempts";
const DRAFT_COLLECTION = "quizDraftAttempts";

/**
 * Save a completed quiz attempt
 */
export async function createQuizAttempt(
  attempt: QuizAttempt
): Promise<void> {
  const payload = removeUndefinedValues({
    ...attempt,

    // Manual marking defaults
    manualMarks: [],
    manualScore: 0,

    // Initial final result equals objective score
    finalScore: attempt.score,
    finalPercentage: attempt.percentage,

    // Tutor workflow
    tutorRemarks: "",
    released: false,
    releasedAt: null,

    completed: true,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, COLLECTION), payload);
}

/**
 * Firestore rejects undefined values, including undefined properties nested
 * inside answer objects. Optional answer fields are therefore removed before
 * the attempt is written. Dates, Firestore sentinels and other non-plain
 * objects are preserved unchanged.
 */
function removeUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedValues(item)) as T;
  }

  if (
    value !== null &&
    typeof value === "object" &&
    Object.getPrototypeOf(value) === Object.prototype
  ) {
    const cleaned = Object.entries(value as Record<string, unknown>).reduce<
      Record<string, unknown>
    >((result, [key, item]) => {
      if (item !== undefined) {
        result[key] = removeUndefinedValues(item);
      }

      return result;
    }, {});

    return cleaned as T;
  }

  return value;
}
/**
 * Save or update an unfinished quiz attempt
 */
export async function saveQuizDraftAttempt({
  quizId,
  studentId,
  data,
}: {
  quizId: string;
  studentId: string;
  data: Record<string, unknown>;
}): Promise<void> {
  const draftId = `${studentId}_${quizId}`;

  await setDoc(
    doc(db, DRAFT_COLLECTION, draftId),
    {
      id: draftId,
      quizId,
      studentId,
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Get unfinished quiz attempt for one student and one quiz
 */
export async function getQuizDraftAttempt({
  quizId,
  studentId,
}: {
  quizId: string;
  studentId: string;
}): Promise<Record<string, unknown> | null> {
  const draftId = `${studentId}_${quizId}`;
  const snapshot = await getDoc(doc(db, DRAFT_COLLECTION, draftId));

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data();
}

/**
 * Delete unfinished quiz attempt after final submission
 */
export async function deleteQuizDraftAttempt({
  quizId,
  studentId,
}: {
  quizId: string;
  studentId: string;
}): Promise<void> {
  const draftId = `${studentId}_${quizId}`;

  await deleteDoc(doc(db, DRAFT_COLLECTION, draftId));
}


/**
 * Get every completed quiz attempt.
 * Intended for tutor and administrator dashboards.
 */
export async function getAllQuizAttempts(): Promise<QuizAttempt[]> {
  const snapshot = await getDocs(collection(db, COLLECTION));

  return snapshot.docs
    .map((docSnap) => ({
      ...(docSnap.data() as QuizAttempt),
      id: docSnap.id,
    }))
    .filter((attempt) => attempt.completed !== false)
    .sort((a, b) => {
      const aTime =
        normalizeDate(a.submittedAt)?.getTime() ||
        normalizeDate(a.createdAt)?.getTime() ||
        0;
      const bTime =
        normalizeDate(b.submittedAt)?.getTime() ||
        normalizeDate(b.createdAt)?.getTime() ||
        0;

      return bTime - aTime;
    });
}

/** Get one attempt by document ID. */
export async function getQuizAttemptById(
  attemptId: string
): Promise<QuizAttempt | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, attemptId));

  if (!snapshot.exists()) return null;

  return {
    ...(snapshot.data() as QuizAttempt),
    id: snapshot.id,
  };
}

/**
 * Get all quiz attempts for one student
 */
export async function getQuizAttemptsByStudent(
  studentId: string
): Promise<QuizAttempt[]> {
  const q = query(
    collection(db, COLLECTION),
    where("studentId", "==", studentId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as QuizAttempt),
    id: docSnap.id,
  }));
}

/**
 * Alias for clearer naming in assessment history pages
 */
export async function getStudentQuizAttempts(
  studentId: string
): Promise<QuizAttempt[]> {
  return getQuizAttemptsByStudent(studentId);
}

/**
 * Get all attempts for a specific quiz
 * Tutor analytics
 */
export async function getQuizAttemptsByQuiz(
  quizId: string
): Promise<QuizAttempt[]> {
  const q = query(collection(db, COLLECTION), where("quizId", "==", quizId));

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnap) => ({
      ...(docSnap.data() as QuizAttempt),
      id: docSnap.id,
    }))
    .sort((a, b) => {
      const aTime = normalizeDate(a.submittedAt)?.getTime() || 0;
      const bTime = normalizeDate(b.submittedAt)?.getTime() || 0;

      return bTime - aTime;
    });
}

export async function saveManualMarks({
  attemptId,
  manualMarks,
  manualScore,
  finalScore,
  finalPercentage,
  tutorRemarks,
}: {
  attemptId: string;
  manualMarks: ManualMark[];
  manualScore: number;
  finalScore: number;
  finalPercentage: number;
  tutorRemarks?: string;
}): Promise<void> {
  await updateDoc(doc(db, COLLECTION, attemptId), {
    manualMarks,
    manualScore,
    finalScore,
    finalPercentage,
    tutorRemarks: tutorRemarks || "",
    updatedAt: serverTimestamp(),
  });
}

export async function releaseQuizAttemptResults({
  attemptId,
  manualMarks,
  manualScore,
  finalScore,
  finalPercentage,
  tutorRemarks,
  passed,
}: {
  attemptId: string;
  manualMarks: ManualMark[];
  manualScore: number;
  finalScore: number;
  finalPercentage: number;
  tutorRemarks?: string;
  passed: boolean;
}): Promise<void> {
  await updateDoc(doc(db, COLLECTION, attemptId), {
    manualMarks,
    manualScore,
    finalScore,
    finalPercentage,
    tutorRemarks: tutorRemarks || "",
    passed,
    released: true,
    releasedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

function normalizeDate(value: unknown): Date | null {
  if (!value) return null;

  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}