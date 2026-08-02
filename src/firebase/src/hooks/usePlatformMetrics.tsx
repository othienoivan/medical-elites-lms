import { useCallback, useEffect, useState } from "react";

import {
  getPlatformActivity,
  getPlatformMetrics,
  type PlatformActivity,
  type PlatformMetrics,
} from "../firebase/platformMetrics";

const EMPTY_METRICS: PlatformMetrics = {
  users: 0,
  students: 0,
  tutors: 0,
  admins: 0,
  activeUsers: 0,
  programmes: 0,
  courseUnits: 0,
  quizzes: 0,
  attendanceSessions: 0,
  payments: 0,
  revenue: 0,
  outstandingBalance: 0,
  aiSessions: 0,
  contactRequests: 0,
  newContactRequests: 0,
  pendingTutorRequests: 0,
};

export default function usePlatformMetrics() {
  const [metrics, setMetrics] = useState<PlatformMetrics>(EMPTY_METRICS);
  const [activity, setActivity] = useState<PlatformActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [nextMetrics, nextActivity] = await Promise.all([
        getPlatformMetrics(),
        getPlatformActivity(),
      ]);
      setMetrics(nextMetrics);
      setActivity(nextActivity);
    } catch (caughtError) {
      console.error("Failed to load platform metrics:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Platform metrics could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [load]);

  return { metrics, activity, loading, error, reload: load };
}
