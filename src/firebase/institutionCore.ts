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
  writeBatch,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type {
  AcademicYear,
  Department,
  InstitutionSettings,
  Semester,
} from "../models/InstitutionCore";

type CollectionRecord = AcademicYear | Semester | Department;

async function listCollection<T extends CollectionRecord>(name: string): Promise<T[]> {
  const snapshot = await getDocs(query(collection(db, name), orderBy("name")));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as T));
}

async function createRecord<T extends CollectionRecord>(name: string, data: Omit<T, "id">) {
  const reference = await addDoc(collection(db, name), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return reference.id;
}

async function updateRecord<T extends CollectionRecord>(name: string, id: string, data: Partial<Omit<T, "id">>) {
  await updateDoc(doc(db, name, id), { ...data, updatedAt: serverTimestamp() });
}

async function deleteRecord(name: string, id: string) {
  await deleteDoc(doc(db, name, id));
}

async function deactivateActiveRecords(
  collectionName: "academicYears" | "semesters",
  excludeId?: string,
  academicYearId?: string,
) {
  const filters = [where("status", "==", "active")];
  if (collectionName === "semesters" && academicYearId) {
    filters.push(where("academicYearId", "==", academicYearId));
  }

  const snapshot = await getDocs(query(collection(db, collectionName), ...filters));
  const batch = writeBatch(db);
  snapshot.docs.forEach((item) => {
    if (item.id !== excludeId) {
      batch.update(item.ref, { status: "inactive", updatedAt: serverTimestamp() });
    }
  });
  await batch.commit();
}

export const getAcademicYears = () => listCollection<AcademicYear>("academicYears");
export async function createAcademicYear(data: Omit<AcademicYear, "id">) {
  if (data.status === "active") await deactivateActiveRecords("academicYears");
  return createRecord<AcademicYear>("academicYears", data);
}
export async function updateAcademicYear(id: string, data: Partial<Omit<AcademicYear, "id">>) {
  if (data.status === "active") await deactivateActiveRecords("academicYears", id);
  return updateRecord<AcademicYear>("academicYears", id, data);
}
export const deleteAcademicYear = (id: string) => deleteRecord("academicYears", id);

export const getSemesters = () => listCollection<Semester>("semesters");
export async function createSemester(data: Omit<Semester, "id">) {
  if (data.status === "active") await deactivateActiveRecords("semesters", undefined, data.academicYearId);
  return createRecord<Semester>("semesters", data);
}
export async function updateSemester(id: string, data: Partial<Omit<Semester, "id">>) {
  if (data.status === "active") {
    const existing = await getDoc(doc(db, "semesters", id));
    const academicYearId = String(data.academicYearId ?? existing.data()?.academicYearId ?? "");
    if (academicYearId) await deactivateActiveRecords("semesters", id, academicYearId);
  }
  return updateRecord<Semester>("semesters", id, data);
}
export const deleteSemester = (id: string) => deleteRecord("semesters", id);

export const getDepartments = () => listCollection<Department>("departments");
export const createDepartment = (data: Omit<Department, "id">) => createRecord<Department>("departments", data);
export const updateDepartment = (id: string, data: Partial<Omit<Department, "id">>) => updateRecord<Department>("departments", id, data);
export const deleteDepartment = (id: string) => deleteRecord("departments", id);

export async function getInstitutionSettings(): Promise<InstitutionSettings | null> {
  const snapshot = await getDoc(doc(db, "institutionSettings", "primary"));
  return snapshot.exists() ? ({ ...snapshot.data(), id: "primary" } as InstitutionSettings) : null;
}

export async function saveInstitutionSettings(settings: InstitutionSettings): Promise<void> {
  await setDoc(doc(db, "institutionSettings", "primary"), {
    ...settings,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
