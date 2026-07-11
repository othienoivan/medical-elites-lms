import { useCallback, useEffect, useState } from "react";

import { getQuestions } from "../firebase/questions";
import type { Question } from "../models/Question";

export default function useQuestionBank() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getQuestions();

      setQuestions(data);
    } catch (error) {
      console.error("Failed to load question bank:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadQuestions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadQuestions]);

  return {
    questions,
    loading,
    refresh: loadQuestions,
  };
}