import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { CourseUnit } from "../models/CourseUnit";

const COLLECTION = "courses";

export async function createCourseUnit(
  courseUnit: CourseUnit
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...courseUnit,
    id: "",
  });

  await updateDoc(doc(db, COLLECTION, docRef.id), {
    id: docRef.id,
  });

  return docRef.id;
}

export async function getCourseUnits(): Promise<CourseUnit[]> {
  const q = query(collection(db, COLLECTION), orderBy("title"));

  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((docSnap) => ({
      ...(docSnap.data() as Omit<CourseUnit, "id">),
      id: docSnap.id,
    }))
    .filter((courseUnit) => courseUnit.published === true);
}