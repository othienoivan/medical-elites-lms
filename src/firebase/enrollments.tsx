import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
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