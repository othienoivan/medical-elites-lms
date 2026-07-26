import { useCallback, useEffect, useState } from "react";

import {
  getAttendanceSessions,
  saveAttendanceSession,
} from "../firebase/attendance";
import type { AttendanceSession } from "../models/Attendance";

type NewAttendanceSession = Omit<
  AttendanceSession,
  "id" | "createdAt" | "updatedAt"
>;

export default function useAttendance() {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSessions(await getAttendanceSessions());
    } catch (caughtError) {
      console.error("Failed to load attendance:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load attendance."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  async function saveSession(
    session: NewAttendanceSession,
    sessionId?: string
  ) {
    const id = await saveAttendanceSession(session, sessionId);
    await loadSessions();
    return id;
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSessions();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadSessions]);

  return { sessions, loading, error, loadSessions, saveSession };
}
