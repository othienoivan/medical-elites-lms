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

import { db } from "../config/firebase";
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