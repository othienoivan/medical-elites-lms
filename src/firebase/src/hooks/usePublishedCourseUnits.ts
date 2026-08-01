import { useEffect, useState } from "react";

import { getPublishedCourseUnits } from "../firebase/courseUnits";
import type { CourseUnit } from "../models/CourseUnit";

/** Public catalogue hook. It deliberately does not depend on the signed-in user's academic scope. */
export default function usePublishedCourseUnits() {
  const [courseUnits, setCourseUnits] = useState<CourseUnit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const rows = await getPublishedCourseUnits();
        if (active) setCourseUnits(rows);
      } catch (loadError) {
        console.error("Failed to load the public course-unit catalogue:", loadError);
        if (active) {
          setCourseUnits([]);
          setError("Published course units could not be loaded. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  return { courseUnits, loading, error };
}
