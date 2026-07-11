import { useCallback, useEffect, useState } from "react";

import {
  createStudentRecord,
  deleteStudentRecord,
  getStudents,
  updateStudentRecord,
} from "../firebase/students";
import type { Student } from "../models/Student";

type NewStudent = Omit<Student, "id" | "createdAt" | "updatedAt">;

export default function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setStudents(await getStudents());
    } catch (caughtError) {
      console.error("Failed to load students:", caughtError);
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load students.");
    } finally {
      setLoading(false);
    }
  }, []);

  async function createStudent(student: NewStudent) {
    const id = await createStudentRecord(student);
    await loadStudents();
    return id;
  }

  async function updateStudent(studentId: string, updates: Partial<Student>) {
    await updateStudentRecord(studentId, updates);
    await loadStudents();
  }

  async function deleteStudent(studentId: string) {
    await deleteStudentRecord(studentId);
    await loadStudents();
  }

  useEffect(() => {
    // Initial Firestore hydration for this data hook.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStudents();
  }, [loadStudents]);

  return { students, loading, error, loadStudents, createStudent, updateStudent, deleteStudent };
}
