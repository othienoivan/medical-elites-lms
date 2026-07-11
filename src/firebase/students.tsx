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
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Student } from "../models/Student";

const COLLECTION = "students";
type NewStudent = Omit<Student, "id" | "createdAt" | "updatedAt">;

function fromSnapshot(id: string, data: Record<string, unknown>): Student {
  return { ...(data as unknown as Student), id };
}

export async function createStudentRecord(student: NewStudent): Promise<string> {
  const duplicateQueries = [
    student.registrationNumber
      ? query(collection(db, COLLECTION), where("registrationNumber", "==", student.registrationNumber))
      : null,
    student.studentNumber
      ? query(collection(db, COLLECTION), where("studentNumber", "==", student.studentNumber))
      : null,
    student.authUid
      ? query(collection(db, COLLECTION), where("authUid", "==", student.authUid))
      : null,
  ].filter(Boolean);

  for (const duplicateQuery of duplicateQueries) {
    const result = await getDocs(duplicateQuery!);
    if (!result.empty) {
      throw new Error("A student with the same registration number, student number, or Auth UID already exists.");
    }
  }

  // Firestore rejects fields whose value is undefined. Optional form fields
  // (especially authUid) are therefore omitted before the document is written.
  const cleanStudent = Object.fromEntries(
    Object.entries({
      ...student,
      email: student.email.trim(),
      emailNormalized: student.email.trim().toLowerCase(),
    }).filter(([, value]) => value !== undefined)
  );

  const reference = await addDoc(collection(db, COLLECTION), {
    ...cleanStudent,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function getStudents(): Promise<Student[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
  );
  return snapshot.docs.map((item) => fromSnapshot(item.id, item.data()));
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, studentId));
  return snapshot.exists() ? fromSnapshot(snapshot.id, snapshot.data()) : null;
}


export async function getStudentByAuthIdentity(
  authUid: string,
  email?: string | null
): Promise<Student | null> {
  const byUid = await getDocs(
    query(collection(db, COLLECTION), where("authUid", "==", authUid))
  );

  if (!byUid.empty) {
    const item = byUid.docs[0];
    return fromSnapshot(item.id, item.data());
  }

  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    const byNormalizedEmail = await getDocs(
      query(
        collection(db, COLLECTION),
        where("emailNormalized", "==", normalizedEmail)
      )
    );

    if (!byNormalizedEmail.empty) {
      const item = byNormalizedEmail.docs[0];
      return fromSnapshot(item.id, item.data());
    }

    const byEmail = await getDocs(
      query(collection(db, COLLECTION), where("email", "==", email.trim()))
    );

    if (!byEmail.empty) {
      const item = byEmail.docs[0];
      return fromSnapshot(item.id, item.data());
    }
  }

  return null;
}

export async function updateStudentRecord(
  studentId: string,
  updates: Partial<Omit<Student, "id" | "createdAt">>
): Promise<void> {
  const cleanUpdates = Object.fromEntries(
    Object.entries({
      ...updates,
      ...(typeof updates.email === "string"
        ? {
            email: updates.email.trim(),
            emailNormalized: updates.email.trim().toLowerCase(),
          }
        : {}),
    }).filter(([, value]) => value !== undefined)
  );

  await updateDoc(doc(db, COLLECTION, studentId), {
    ...cleanUpdates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteStudentRecord(studentId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, studentId));
}
