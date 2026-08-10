import { httpsCallable } from "firebase/functions";
import { functions } from "../config/firebase";
import type { CourseUnit } from "../models/CourseUnit";

export async function getPublicCourseCatalogueSnapshot(): Promise<CourseUnit[]> {
  const callable = httpsCallable<Record<string, never>, { courseUnits: CourseUnit[] }>(
    functions,
    "getPublicCourseCatalogueSnapshotV2",
  );
  return (await callable({})).data.courseUnits ?? [];
}

export const getPublishedCourseUnits = getPublicCourseCatalogueSnapshot;
