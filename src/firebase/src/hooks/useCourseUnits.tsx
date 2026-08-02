import { useEffect, useState } from "react";
import { getAllCourseUnits, getCourseUnits } from "../firebase/courseUnits";
import type { CourseUnit } from "../models/CourseUnit";
import useAccessScope from "./useAccessScope";

export default function useCourseUnits(includeUnpublished = false) {
  const scope = useAccessScope();
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scope) return;
    const activeScope = scope;
    async function loadCourseUnits() {
      try {
        setLoading(true);
        setCourseUnits(includeUnpublished ? await getAllCourseUnits(activeScope) : await getCourseUnits(activeScope));
      } catch (error) {
        console.error("Failed to load course units:", error);
        setCourseUnits([]);
      } finally {
        setLoading(false);
      }
    }
    void loadCourseUnits();
  }, [scope, includeUnpublished]);

  return { courseUnits, loading };
}
