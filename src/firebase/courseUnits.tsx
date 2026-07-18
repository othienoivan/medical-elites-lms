import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { CourseUnit } from "../models/CourseUnit";

const COLLECTION = "courses";

export async function createCourseUnit(courseUnit: CourseUnit): Promise<string> {
  const { id: _id, ...payload } = courseUnit;
  void _id;
  const docRef = await addDoc(collection(db, COLLECTION), payload);
  await updateDoc(doc(db, COLLECTION, docRef.id), { id: docRef.id });
  return docRef.id;
}

export async function getAllCourseUnits(): Promise<CourseUnit[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), orderBy("title")));
  return snapshot.docs.map((item) => ({ ...(item.data() as Omit<CourseUnit, "id">), id: item.id }));
}

export async function getCourseUnits(): Promise<CourseUnit[]> {
  return (await getAllCourseUnits()).filter((courseUnit) => courseUnit.published === true);
}

export async function updateCourseUnit(id: string, data: Partial<CourseUnit>): Promise<void> {
  const { id: _id, ...payload } = data;
  void _id;
  await updateDoc(doc(db, COLLECTION, id), { ...payload, updatedAt: new Date() });
}

export async function countCourseUnitModules(courseUnitId: string): Promise<number> {
  const snapshot = await getDocs(query(collection(db, "modules"), where("courseUnitId", "==", courseUnitId)));
  return snapshot.size;
}

export async function deleteCourseUnit(id: string): Promise<void> {
  const linked = await countCourseUnitModules(id);
  if (linked > 0) throw new Error(`This course unit has ${linked} linked module${linked === 1 ? "" : "s"}. Archive it instead.`);
  await deleteDoc(doc(db, COLLECTION, id));
}
