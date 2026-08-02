import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

import { db, functions } from "../config/firebase";
import type { Enrollment } from "../models/Enrollment";

export async function enrollInCourse({
  userId,
  courseId,
  courseSlug,
  courseTitle,
}: {
  userId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
}) {
  const enrollmentId = `${userId}_${courseId}`;
  const enrollmentRef = doc(db, "enrollments", enrollmentId);

  await setDoc(enrollmentRef, {
    id: enrollmentId,
    userId,
    courseId,
    courseSlug,
    courseTitle,
    status: "active",
    progress: 0,
    completedModules: [],
    unlockedModules: ["module-1"],
    enrolledAt: serverTimestamp(),
  });
}

export async function getUserEnrollments(userId: string) {
  const enrollmentsRef = collection(db, "enrollments");

  const q = query(enrollmentsRef, where("userId", "==", userId));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => docSnap.data() as Enrollment);
}

/**
 * Marks the current module as completed
 * Unlocks the next module
 * Updates overall course progress
 */
export async function completeModuleAndUnlockNext({
  userId,
  courseId,
  moduleId,
  nextModuleId,
  progress,
}: {
  userId: string;
  courseId: string;
  moduleId: string;
  nextModuleId?: string;
  progress: number;
}) {
  const enrollmentId = `${userId}_${courseId}`;
  const enrollmentRef = doc(db, "enrollments", enrollmentId);

  const snapshot = await getDoc(enrollmentRef);

  if (!snapshot.exists()) {
    throw new Error("Enrollment not found.");
  }

  const enrollment = snapshot.data();

  const completedModules = new Set<string>(
    enrollment.completedModules ?? []
  );

  completedModules.add(moduleId);

  const unlockedModules = new Set<string>(
    enrollment.unlockedModules ?? []
  );

  if (nextModuleId) {
    unlockedModules.add(nextModuleId);
  }

  await updateDoc(enrollmentRef, {
    completedModules: Array.from(completedModules),
    unlockedModules: Array.from(unlockedModules),
    progress,
    updatedAt: serverTimestamp(),
  });
}
/** Records that a learner has opened a module at least once. */
export async function markModuleStarted({
  userId,
  courseId,
  moduleId,
}: {
  userId: string;
  courseId: string;
  moduleId: string;
}): Promise<void> {
  const matches = new Map<string, ReturnType<typeof doc>>();
  const directRef = doc(db, "enrollments", `${userId}_${courseId}`);
  const direct = await getDoc(directRef);
  if (direct.exists()) matches.set(directRef.path, directRef);

  const queries = await Promise.allSettled([
    getDocs(query(collection(db, "enrollments"), where("userId", "==", userId))),
    getDocs(query(collection(db, "enrollments"), where("studentAuthUid", "==", userId))),
  ]);

  for (const result of queries) {
    if (result.status !== "fulfilled") continue;
    for (const snapshot of result.value.docs) {
      const data = snapshot.data() as {
        courseId?: string;
        courseUnitId?: string;
        courseUnitIds?: string[];
      };
      const belongsToCourse =
        data.courseId === courseId ||
        data.courseUnitId === courseId ||
        data.courseUnitIds?.includes(courseId);
      if (belongsToCourse) matches.set(snapshot.ref.path, snapshot.ref);
    }
  }

  await Promise.all(
    [...matches.values()].map(async (reference) => {
      const snapshot = await getDoc(reference);
      if (!snapshot.exists()) return;
      const startedModules = new Set<string>(snapshot.data().startedModules ?? []);
      if (startedModules.has(moduleId)) return;
      startedModules.add(moduleId);
      await updateDoc(reference, {
        startedModules: [...startedModules],
        updatedAt: serverTimestamp(),
      });
    }),
  );
}


/** Securely complete a module after backend progression validation. */
export async function completeModuleLearning(moduleId: string): Promise<void> {
  const callable = httpsCallable<{ moduleId: string }, { completed: boolean }>(
    functions,
    "completeModuleLearning",
  );
  await callable({ moduleId });
}
