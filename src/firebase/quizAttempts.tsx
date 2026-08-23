import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import type { ManualMark } from "../models/QuizAttempt";
import { httpsCallable } from "firebase/functions";

import { db, functions } from "../config/firebase";
import type { QuizAttempt } from "../models/QuizAttempt";

const COLLECTION = "quizAttempts";
const DRAFT_COLLECTION = "quizDraftAttempts";

/** Quiz attempt usage returned by the backend. */
export type QuizAttemptUsage = {
  attemptsUsed: number;
  maximumAttempts: number;
  attemptsRemaining: number;
};

type AiMarkedAttemptResult = {
  aiMarked: boolean;
  finalScore?: number;
  finalPercentage?: number;
  passed?: boolean;
  needsTutorReview?: boolean;
};

type SubmitQuizAttemptResponse = QuizAttemptUsage & {
  attemptId: string;
  aiMarking?: AiMarkedAttemptResult;
};

/**
 * Save a completed quiz attempt through the trusted backend. The callable
 * enforces the tutor-defined attempt limit atomically before writing.
 */
export async function createQuizAttempt(
  attempt: QuizAttempt
): Promise<SubmitQuizAttemptResponse> {
  const callable = httpsCallable<QuizAttempt, SubmitQuizAttemptResponse>(
    functions,
    "submitQuizAttempt",
  );
  const result = await callable(removeUndefinedValues(attempt));

  try {
    const aiMarker = httpsCallable<
      { attemptId: string },
      AiMarkedAttemptResult
    >(functions, "aiMarkEssayAttempt");
    const marking = await aiMarker({ attemptId: result.data.attemptId });
    return { ...result.data, aiMarking: marking.data };
  } catch (error) {
    console.warn(
      "Attempt was saved, but AI marking could not be completed automatically.",
      error,
    );
    return result.data;
  }
}

/** Read completed-attempt usage for one learner and quiz. */
export async function getQuizAttemptUsage({
  quizId,
  studentId: _studentId,
  maximumAttempts: _maximumAttempts,
}: {
  quizId: string;
  studentId: string;
  maximumAttempts: number;
}): Promise<QuizAttemptUsage> {
  const callable = httpsCallable<
    { quizId: string },
    QuizAttemptUsage & { baseAttempts?: number; extraAttemptsGranted?: number }
  >(functions, "getStudentQuizAttemptUsage");
  const result = await callable({ quizId });
  return result.data;
}

export async function requestStudentQuizReattempt({
  quizId,
  message = "",
}: {
  quizId: string;
  message?: string;
}): Promise<{ success: boolean; pending: boolean; message: string }> {
  const callable = httpsCallable<
    { quizId: string; message: string },
    { success: boolean; pending: boolean; message: string }
  >(functions, "requestStudentQuizReattempt");
  const result = await callable({ quizId, message });
  return result.data;
}

export async function getStudentPostQuizDestination(quizId: string): Promise<{ path: string; kind: string }> {
  const callable = httpsCallable<{ quizId: string }, { path: string; kind: string }>(
    functions,
    "getStudentPostQuizDestination",
  );
  const result = await callable({ quizId });
  return result.data;
}

export async function grantStudentLearningProgressionOverride({ studentId, quizId, reason }: { studentId: string; quizId: string; reason: string }): Promise<{ success: boolean; targetModuleId?: string | null; targetLessonId?: string | null; path: string }> {
  const callable = httpsCallable<{ studentId: string; quizId: string; reason: string }, { success: boolean; targetModuleId?: string | null; targetLessonId?: string | null; path: string }>(functions, "grantStudentLearningProgressionOverride");
  const result = await callable({ studentId, quizId, reason });
  return result.data;
}

export async function grantStudentQuizReattempt({
  quizId,
  studentId,
  reason,
  extraAttempts = 1,
}: {
  quizId: string;
  studentId: string;
  reason: string;
  extraAttempts?: number;
}): Promise<{ success: boolean; extraAttemptsGranted: number; maximumAttempts: number }> {
  const callable = httpsCallable<
    { quizId: string; studentId: string; reason: string; extraAttempts: number },
    { success: boolean; extraAttemptsGranted: number; maximumAttempts: number }
  >(functions, "grantStudentQuizReattempt");
  const result = await callable({ quizId, studentId, reason, extraAttempts });
  return result.data;
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
export async function getAllQuizAttempts(tutorUid: string): Promise<QuizAttempt[]> {
  if (!tutorUid) return [];
  try {
    const callable = httpsCallable<Record<string, never>, { attempts: QuizAttempt[] }>(functions, "getTutorAssessmentAttempts");
    const result = await callable({});
    return (result.data.attempts ?? []).map((attempt) => ({
      ...attempt,
      startedAt: normalizeDate(attempt.startedAt) ?? new Date(0),
      submittedAt: normalizeDate(attempt.submittedAt) ?? undefined,
      createdAt: normalizeDate(attempt.createdAt) ?? undefined,
      updatedAt: normalizeDate(attempt.updatedAt) ?? undefined,
      releasedAt: normalizeDate(attempt.releasedAt) ?? undefined,
    }));
  } catch (callableError) {
    console.warn("Trusted assessment workspace loader failed; using canonical Firestore ownership queries.", callableError);
  }
  const snapshots = await Promise.allSettled([
    getDocs(query(collection(db, COLLECTION), where("tutorUid", "==", tutorUid))),
    getDocs(query(collection(db, COLLECTION), where("createdByUid", "==", tutorUid))),
    getDocs(query(collection(db, COLLECTION), where("ownerUserId", "==", tutorUid))),
  ]);
  const documents = snapshots.flatMap((result) => result.status === "fulfilled" ? result.value.docs : []);
  const unique = [...new Map(documents.map((item) => [item.id, item])).values()];
  return unique.map((docSnap) => ({ ...(docSnap.data() as QuizAttempt), id: docSnap.id })).filter((attempt) => attempt.completed !== false).sort((a, b) => (normalizeDate(b.submittedAt)?.getTime() || normalizeDate(b.createdAt)?.getTime() || 0) - (normalizeDate(a.submittedAt)?.getTime() || normalizeDate(a.createdAt)?.getTime() || 0));
}

/** Get one attempt by document ID. */
export async function getQuizAttemptById(
  attemptId: string
): Promise<QuizAttempt | null> {
  if (!attemptId) return null;

  // Tutor marking must not depend on direct browser reads of quizAttempts.
  // Older attempts may not carry the newest ownership fields, so the trusted
  // callable resolves ownership through the linked quiz before returning it.
  try {
    const callable = httpsCallable<{ attemptId: string }, { attempt: QuizAttempt | null }>(
      functions,
      "getTutorAssessmentAttempt",
    );
    const result = await callable({ attemptId });
    const attempt = result.data.attempt;
    if (!attempt) return null;
    return {
      ...attempt,
      startedAt: normalizeDate(attempt.startedAt) ?? new Date(0),
      submittedAt: normalizeDate(attempt.submittedAt) ?? undefined,
      createdAt: normalizeDate(attempt.createdAt) ?? undefined,
      updatedAt: normalizeDate(attempt.updatedAt) ?? undefined,
      releasedAt: normalizeDate(attempt.releasedAt) ?? undefined,
    };
  } catch (callableError) {
    console.warn("Trusted attempt loader failed; falling back to direct read.", callableError);
  }

  const snapshot = await getDoc(doc(db, COLLECTION, attemptId));
  if (!snapshot.exists()) return null;
  return { ...(snapshot.data() as QuizAttempt), id: snapshot.id };
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
  attemptId, manualMarks, manualScore, finalScore, finalPercentage, tutorRemarks,
}: {
  attemptId: string; manualMarks: ManualMark[]; manualScore: number; finalScore: number; finalPercentage: number; tutorRemarks?: string;
}): Promise<void> {
  const callable = httpsCallable(functions, "saveTutorAssessmentMarking");
  await callable({ attemptId, manualMarks, manualScore, finalScore, finalPercentage, tutorRemarks: tutorRemarks || "", release: false });
}

export async function releaseQuizAttemptResults({
  attemptId, manualMarks, manualScore, finalScore, finalPercentage, tutorRemarks, passed,
}: {
  attemptId: string; manualMarks: ManualMark[]; manualScore: number; finalScore: number; finalPercentage: number; tutorRemarks?: string; passed: boolean;
}): Promise<void> {
  const callable = httpsCallable(functions, "saveTutorAssessmentMarking");
  await callable({ attemptId, manualMarks, manualScore, finalScore, finalPercentage, tutorRemarks: tutorRemarks || "", passed, release: true });
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