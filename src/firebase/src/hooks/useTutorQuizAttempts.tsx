import { useCallback, useEffect, useState } from "react";

import { getAllQuizAttempts } from "../firebase/quizAttempts";
import useAuth from "./useAuth";
import type { QuizAttempt } from "../models/QuizAttempt";

export default function useTutorQuizAttempts() {
  const { currentUser } = useAuth();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = currentUser ? await getAllQuizAttempts(currentUser.uid) : [];
      setAttempts(data);
    } catch (loadError) {
      console.error("Failed to load tutor quiz attempts:", loadError);
      setError("Unable to load assessment submissions.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void reload();
  }, [reload]);

  return { attempts, loading, error, reload };
}
