import { useCallback, useEffect, useState } from "react";

import { getQuizAttemptById } from "../firebase/quizAttempts";
import type { QuizAttempt } from "../models/QuizAttempt";

export default function useQuizAttempt(attemptId?: string) {
  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!attemptId) {
      setAttempt(null);
      setError("Assessment attempt ID is missing.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAttempt(await getQuizAttemptById(attemptId));
    } catch (loadError) {
      console.error("Failed to load quiz attempt:", loadError);
      setError("Unable to load this assessment attempt.");
      setAttempt(null);
    } finally {
      setLoading(false);
    }
  }, [attemptId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  return { attempt, loading, error, reload };
}
