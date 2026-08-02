import { useCallback, useEffect, useState } from "react";
import { getQuestions } from "../firebase/questions";
import type { Question } from "../models/Question";
import useAccessScope from "./useAccessScope";

export default function useQuestionBank() {
  const scope = useAccessScope();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const loadQuestions = useCallback(async () => {
    if (!scope) return;
    try {
      setLoading(true);
      setQuestions(await getQuestions(scope));
    } catch (error) {
      console.error("Failed to load question bank:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadQuestions(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadQuestions]);
  return { questions, loading, refresh: loadQuestions };
}
