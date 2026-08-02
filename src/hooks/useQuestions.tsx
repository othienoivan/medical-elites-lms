import { useCallback, useEffect, useState } from "react";
import { getQuestions } from "../firebase/questions";
import type { Question } from "../models/Question";
import useAccessScope from "./useAccessScope";

export default function useQuestions() {
  const scope = useAccessScope();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!scope) return;
    setLoading(true);
    try {
      setQuestions(await getQuestions(scope));
    } catch (error) {
      console.error("Failed to load questions:", error);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => { void refresh(); }, [refresh]);
  return { questions, loading, refresh };
}
