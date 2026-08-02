import { useCallback, useEffect, useState } from "react";
import type { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

import { getQuizAttemptsPage } from "../firebase/quizAttempts";
import type { QuizAttempt } from "../models/QuizAttempt";

export default function useTutorQuizAttempts() {
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [cursor, setCursor] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const page = await getQuizAttemptsPage();
      setAttempts(page.attempts);
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch (loadError) {
      console.error("Failed to load tutor quiz attempts:", loadError);
      setError("Unable to load assessment submissions.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || loadingMore) return;

    try {
      setLoadingMore(true);
      setError(null);
      const page = await getQuizAttemptsPage({ cursor });
      setAttempts((current) => {
        const merged = [...current, ...page.attempts];
        return [...new Map(merged.map((attempt) => [attempt.id, attempt])).values()];
      });
      setCursor(page.cursor);
      setHasMore(page.hasMore);
    } catch (loadError) {
      console.error("Failed to load more tutor quiz attempts:", loadError);
      setError("Unable to load more assessment submissions.");
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasMore, loadingMore]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { attempts, loading, loadingMore, hasMore, error, reload, loadMore };
}
