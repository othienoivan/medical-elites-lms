import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Student } from "../models/Student";
import { requireAccessScope, type AccessScope } from "./accessScope";

const COLLECTION = "students";
type NewStudent = Omit<Student, "id" | "createdAt" | "updatedAt">;

function fromSnapshot(id: string, data: Record<string, unknown>): Student {
  return { ...(data as unknown as Student), id };
}

function dedupe(rows: Student[]): Student[] {
  return [...new Map(rows.map((row) => [row.id, row])).values()];
}

export async function createStudentRecord(student: NewStudent, scope: AccessScope): Promise<string> {
  const access = requireAccessScope(scope);
  if (access.role === "student") throw new Error("Students cannot create student records.");

  const ownershipFilter = access.role === "admin" && access.institutionId
    ? where("institutionId", "==", access.institutionId)
    : where("ownerUserId", "==", access.uid);

  const duplicateFields: Array<["registrationNumber" | "studentNumber" | "authUid", string | undefined]> = [
    ["registrationNumber", student.registrationNumber],
    ["studentNumber", student.studentNumber],
    ["authUid", student.authUid],
  ];

  for (const [field, value] of duplicateFields) {
    if (!value) continue;
    const result = await getDocs(query(collection(db, COLLECTION), ownershipFilter, where(field, "==", value)));
    if (!result.empty) {
      throw new Error("A student with the same registration number, student number, or Auth UID already exists in your workspace.");
    }
  }

  const cleanStudent = Object.fromEntries(
    Object.entries({
      ...student,
      ownerUserId: access.uid,
      createdByUid: access.uid,
      registeredByRole: access.role,
      institutionId: access.institutionId ?? null,
      assignedTutorIds: access.role === "tutor"
        ? Array.from(new Set([access.uid, ...(student.assignedTutorIds ?? [])]))
        : (student.assignedTutorIds ?? []),
      onboardingSource: access.role === "tutor" ? "tutor" : "admin",
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

export async function getStudents(scope: AccessScope): Promise<Student[]> {
  const access = requireAccessScope(scope);

  if (access.role === "student") {
    const byUid = await getDocs(query(collection(db, COLLECTION), where("authUid", "==", access.uid)));
    return byUid.docs.map((item) => fromSnapshot(item.id, item.data()));
  }

  if (access.role === "admin" && access.institutionId) {
    const snapshot = await getDocs(query(collection(db, COLLECTION), where("institutionId", "==", access.institutionId)));
    return snapshot.docs.map((item) => fromSnapshot(item.id, item.data()));
  }

  const queryResults = await Promise.allSettled([
    getDocs(query(collection(db, COLLECTION), where("ownerUserId", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("createdByUid", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("createdBy", "==", access.uid))),
    getDocs(query(collection(db, COLLECTION), where("assignedTutorIds", "array-contains", access.uid))),
  ]);

  const rows: Student[] = [];
  for (const result of queryResults) {
    if (result.status === "fulfilled") {
      rows.push(...result.value.docs.map((item) => fromSnapshot(item.id, item.data())));
    } else {
      console.warn("A student ownership query failed and was skipped:", result.reason);
    }
  }

  return dedupe(rows);
}

export async function getStudentById(studentId: string): Promise<Student | null> {
  const snapshot = await getDoc(doc(db, COLLECTION, studentId));
  return snapshot.exists() ? fromSnapshot(snapshot.id, snapshot.data()) : null;
}

export async function getStudentByAuthIdentity(authUid: string, email?: string | null): Promise<Student | null> {
  const byUid = await getDocs(query(collection(db, COLLECTION), where("authUid", "==", authUid)));
  if (!byUid.empty) return fromSnapshot(byUid.docs[0].id, byUid.docs[0].data());

  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    const byNormalizedEmail = await getDocs(query(collection(db, COLLECTION), where("emailNormalized", "==", normalizedEmail)));
    if (!byNormalizedEmail.empty) return fromSnapshot(byNormalizedEmail.docs[0].id, byNormalizedEmail.docs[0].data());
  }
  return null;
}

export async function updateStudentRecord(studentId: string, updates: Partial<Omit<Student, "id" | "createdAt">>): Promise<void> {
  const cleanUpdates = Object.fromEntries(
    Object.entries({
      ...updates,
      ...(typeof updates.email === "string" ? {
        email: updates.email.trim(),
        emailNormalized: updates.email.trim().toLowerCase(),
      } : {}),
    }).filter(([, value]) => value !== undefined)
  );
  await updateDoc(doc(db, COLLECTION, studentId), { ...cleanUpdates, updatedAt: serverTimestamp() });
}

export async function deleteStudentRecord(studentId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, studentId));
}
