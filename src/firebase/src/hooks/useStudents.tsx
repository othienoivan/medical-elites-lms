import { useCallback, useEffect, useState } from "react";
import { createStudentRecord, deleteStudentRecord, getStudents, updateStudentRecord } from "../firebase/students";
import type { Student } from "../models/Student";
import useAccessScope from "./useAccessScope";

type NewStudent = Omit<Student, "id" | "createdAt" | "updatedAt">;

export default function useStudents() {
  const scope = useAccessScope();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    if (!scope) return;
    try {
      setLoading(true);
      setError(null);
      setStudents(await getStudents(scope));
    } catch (caughtError) {
      console.error("Failed to load students:", caughtError);
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load students.");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  async function createStudent(student: NewStudent) {
    if (!scope) throw new Error("Your account access profile is not ready.");
    const id = await createStudentRecord(student, scope);
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
    const timer = window.setTimeout(() => { void loadStudents(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadStudents]);
  return { students, loading, error, loadStudents, createStudent, updateStudent, deleteStudent };
}
