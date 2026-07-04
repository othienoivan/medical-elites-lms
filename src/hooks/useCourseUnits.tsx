import { useEffect, useState } from "react";
import { getCourseUnits } from "../firebase/courseUnits";
import type { CourseUnit } from "../models/CourseUnit";

export default function useCourseUnits() {
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourseUnits() {
      try {
        const data = await getCourseUnits();
        setCourseUnits(data.filter((item) => item.published));
      } catch (error) {
        console.error("Failed to load course units:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCourseUnits();
  }, []);

  return { courseUnits, loading };
}