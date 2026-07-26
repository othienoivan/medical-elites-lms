import { useEffect, useState } from "react";

import { getQuizAttemptsByStudent } from "../firebase/quizAttempts";
import useAuth from "./useAuth";
import type { QuizAttempt } from "../models/QuizAttempt";

export default function useQuizAttempts() {
  const { currentUser } = useAuth();

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttempts() {
      if (!currentUser) {
        setAttempts([]);
        setLoading(false);
        return;
      }

      try {
        const data = await getQuizAttemptsByStudent(currentUser.uid);
        setAttempts(data);
      } catch (error) {
        console.error("Failed to load quiz attempts:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAttempts();
  }, [currentUser]);

  return {
    attempts,
    loading,
  };
}