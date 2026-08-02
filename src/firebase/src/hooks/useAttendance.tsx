import { useCallback, useEffect, useState } from "react";

import {
  getAttendanceSessions,
  saveAttendanceSession,
} from "../firebase/attendance";
import useAuth from "./useAuth";
import type { AttendanceSession } from "../models/Attendance";

type NewAttendanceSession = Omit<
  AttendanceSession,
  "id" | "createdAt" | "updatedAt"
>;

export default function useAttendance() {
  const { currentUser } = useAuth();
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setSessions(currentUser ? await getAttendanceSessions(currentUser.uid) : []);
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
  }, [currentUser]);

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
