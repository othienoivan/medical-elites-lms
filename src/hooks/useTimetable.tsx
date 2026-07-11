import { useCallback, useEffect, useState } from "react";
import {
  deleteTimetableEntry,
  getTimetableEntries,
  saveTimetableEntry,
} from "../firebase/timetable";
import type { TimetableEntry } from "../models/Timetable";

type NewEntry = Omit<TimetableEntry, "id" | "createdAt" | "updatedAt">;

export default function useTimetable() {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setEntries(await getTimetableEntries());
    } catch (caughtError) {
      console.error("Failed to load timetable:", caughtError);
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load timetable.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEntries();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadEntries]);

  async function saveEntry(entry: NewEntry, entryId?: string) {
    await saveTimetableEntry(entry, entryId);
    await loadEntries();
  }

  async function removeEntry(entryId: string) {
    await deleteTimetableEntry(entryId);
    await loadEntries();
  }

  return { entries, loading, error, saveEntry, removeEntry, loadEntries };
}
