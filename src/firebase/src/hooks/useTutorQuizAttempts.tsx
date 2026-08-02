import { useCallback, useEffect, useState } from "react";

import { getAllQuizAttempts } from "../firebase/quizAttempts";
import type { QuizAttempt } from "../models/QuizAttempt";

export default function useTutorQuizAttempts() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllQuizAttempts();
      setAttempts(data);
    } catch (loadError) {
      console.error("Failed to load tutor quiz attempts:", loadError);
      setError("Unable to load assessment submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  return { attempts, loading, error, reload };
}
