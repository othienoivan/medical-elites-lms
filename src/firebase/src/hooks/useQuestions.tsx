import { useEffect, useState } from "react";
import { getQuestions } from "../firebase/questions";
import type { Question } from "../models/Question";
import useAccessScope from "./useAccessScope";

export default function useQuestions() {
  const scope = useAccessScope();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scope) return;
    void getQuestions(scope).then(setQuestions).catch((error) => {
      console.error("Failed to load questions:", error);
      setQuestions([]);
    }).finally(() => setLoading(false));
  }, [scope]);

  return { questions, loading };
}
