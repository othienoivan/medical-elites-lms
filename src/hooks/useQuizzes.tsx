import { useCallback, useEffect, useState } from "react";
import { getQuizzes } from "../firebase/quizzes";
import type { Quiz } from "../models/Quiz";
import useAccessScope from "./useAccessScope";

export default function useQuizzes() {
  const scope = useAccessScope();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuizzes = useCallback(async () => {
    if (!scope) return;

    try {
      setLoading(true);

      const data = await getQuizzes(scope);

      setQuizzes(data);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQuizzes();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadQuizzes]);

  return {
    quizzes,
    loading,
    refresh: loadQuizzes,
  };
}