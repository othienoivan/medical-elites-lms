import { useEffect, useState } from "react";
import { getLessons } from "../firebase/lessons";
import type { Lesson } from "../models/Lesson";
import useAccessScope from "./useAccessScope";

export default function useLessons(moduleId?: string, includeUnpublished = true) {
  const scope = useAccessScope();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scope) return;
    if (!moduleId) { setLessons([]); setLoading(false); return; }
    setLoading(true);
    void getLessons(moduleId, scope, includeUnpublished)
      .then(setLessons)
      .catch((error) => { console.error("Failed to load lessons:", error); setLessons([]); })
      .finally(() => setLoading(false));
  }, [moduleId, scope, includeUnpublished]);

  return { lessons, loading };
}
