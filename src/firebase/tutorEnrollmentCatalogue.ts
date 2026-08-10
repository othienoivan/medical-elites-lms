import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import type { CourseUnit } from "../models/CourseUnit";

export async function getTutorEnrollmentCourseUnits(): Promise<CourseUnit[]> {
  const callable = httpsCallable<Record<string, never>, { courseUnits: CourseUnit[] }>(
    functions,
    "getTutorEnrollmentCourseUnits",
  );
  const result = await callable({});
  return result.data.courseUnits ?? [];
}
