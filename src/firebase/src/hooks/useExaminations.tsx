import { useCallback, useEffect, useState } from "react";

import { getExaminations } from "../firebase/examinations";
import type { Examination } from "../models/Examination";

export default function useExaminations() {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExaminations = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getExaminations();

      setExaminations(data);
    } catch (error) {
      console.error("Failed to load examinations:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadExaminations();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadExaminations]);

  return {
    examinations,
    loading,
    refresh: loadExaminations,
  };
}