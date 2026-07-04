import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { CourseUnit } from "../models/CourseUnit";

const COLLECTION = "courseUnits";

export async function createCourseUnit(courseUnit: CourseUnit) {
  await addDoc(collection(db, COLLECTION), courseUnit);
}

export async function getCourseUnits(): Promise<CourseUnit[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("title"))
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<CourseUnit, "id">),
  }));
}