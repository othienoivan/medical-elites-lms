import { useEffect, useState } from "react";
import { getLessons } from "../firebase/lessons";
import type { Lesson } from "../models/Lesson";

export default function useLessons(moduleId?: string) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLessons() {
      if (!moduleId) {
        setLessons([]);
        setLoading(false);
        return;
      }

      try {
        const data = await getLessons(moduleId);
        setLessons(data);
      } catch (error) {
        console.error("Failed to load lessons:", error);
      } finally {
        setLoading(false);
      }
    }

    loadLessons();
  }, [moduleId]);

  return { lessons, loading };
}