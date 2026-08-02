import { useCallback, useEffect, useState } from "react";

import { getExaminations } from "../firebase/examinations";
import type { Examination } from "../models/Examination";
import useAccessScope from "./useAccessScope";

export default function useExaminations() {
  const accessScope = useAccessScope();
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [loading, setLoading] = useState(true);

  const loadExaminations = useCallback(async () => {
    try {
      setLoading(true);

      if (!accessScope) return;
      const data = await getExaminations(accessScope);

      setExaminations(data);
    } catch (error) {
      console.error("Failed to load examinations:", error);
    } finally {
      setLoading(false);
    }
  }, [accessScope]);

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