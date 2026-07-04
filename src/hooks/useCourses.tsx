import { useEffect, useState } from "react";
import { getCourses } from "../firebase/courses";
import type { Course } from "../models/Course";

export default function useCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await getCourses();
        setCourses(data.filter((course) => course.published));
      } catch (error) {
        console.error("Failed to load courses:", error);
      } finally {
        setLoading(false);
      }
    }

    loadCourses();
  }, []);

  return { courses, loading };
}