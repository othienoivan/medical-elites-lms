import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Course } from "../models/Course";

const COLLECTION = "courses";

export async function createCourse(course: Course) {
  await addDoc(collection(db, COLLECTION), course);
}

export async function getCourses(): Promise<Course[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), orderBy("title"))
  );

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Course, "id">),
  }));
}