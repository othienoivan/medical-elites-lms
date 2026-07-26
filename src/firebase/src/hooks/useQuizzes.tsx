import { useCallback, useEffect, useState } from "react";
import { getQuizzes } from "../firebase/quizzes";
import type { Quiz } from "../models/Quiz";

export default function useQuizzes() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuizzes = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getQuizzes();

      setQuizzes(data);
    } catch (error) {
      console.error("Failed to load quizzes:", error);
    } finally {
      setLoading(false);
    }
  }, []);

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