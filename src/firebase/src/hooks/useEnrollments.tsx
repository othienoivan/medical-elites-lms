import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Enrollment } from "../models/Enrollment";

const COLLECTION = "enrollments";

function removeUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedValues(item)) as T;
  }

  if (value instanceof Date || value === null || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, removeUndefinedValues(item)])
  ) as T;
}

export default function useEnrollments() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEnrollments = useCallback(async () => {
    try {
      setLoading(true);

      const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((docSnap) => ({
        ...(docSnap.data() as Enrollment),
        id: docSnap.id,
      }));

      setEnrollments(data);
    } catch (error) {
      console.error("Failed to load enrollments:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  async function createEnrollment(enrollment: Omit<Enrollment, "id">) {
    await addDoc(collection(db, COLLECTION), {
      ...removeUndefinedValues(enrollment),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await loadEnrollments();
  }

  async function updateEnrollment(
    enrollmentId: string,
    updates: Partial<Enrollment>
  ) {
    await updateDoc(doc(db, COLLECTION, enrollmentId), {
      ...removeUndefinedValues(updates),
      updatedAt: serverTimestamp(),
    });

    await loadEnrollments();
  }

  async function deleteEnrollment(enrollmentId: string) {
    await deleteDoc(doc(db, COLLECTION, enrollmentId));
    await loadEnrollments();
  }

  async function getEnrollmentsByStudent(studentId: string) {
    const q = query(
      collection(db, COLLECTION),
      where("studentId", "==", studentId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as Enrollment),
      id: docSnap.id,
    }));
  }

  async function getEnrollmentsByProgramme(programmeId: string) {
    const q = query(
      collection(db, COLLECTION),
      where("programmeId", "==", programmeId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as Enrollment),
      id: docSnap.id,
    }));
  }

  async function getEnrollmentsByCourseUnit(courseUnitId: string) {
    const q = query(
      collection(db, COLLECTION),
      where("courseUnitIds", "array-contains", courseUnitId)
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as Enrollment),
      id: docSnap.id,
    }));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEnrollments();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadEnrollments]);

  return {
    enrollments,
    loading,
    loadEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment,
    getEnrollmentsByStudent,
    getEnrollmentsByProgramme,
    getEnrollmentsByCourseUnit,
  };
}