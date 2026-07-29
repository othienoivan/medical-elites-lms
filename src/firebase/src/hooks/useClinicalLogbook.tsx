import { useCallback, useEffect, useState } from "react";

import {
  createClinicalEntry,
  getAllClinicalEntries,
  getClinicalEntriesByStudent,
  reviewClinicalEntry,
  updateClinicalEntry,
} from "../firebase/clinicalLogbook";
import useAuth from "./useAuth";
import type { ClinicalLogbookEntry } from "../models/ClinicalLogbook";

export function useStudentClinicalLogbook() {
  const { currentUser } = useAuth();
  const [entries, setEntries] = useState<ClinicalLogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    if (!currentUser) {
      setEntries([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      setEntries(await getClinicalEntriesByStudent(currentUser.uid));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load clinical logbook.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadEntries();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadEntries]);

  return { entries, loading, error, loadEntries, createClinicalEntry, updateClinicalEntry };
}

export function useTutorClinicalLogbook() {
  const [entries, setEntries] = useState<ClinicalLogbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setEntries(await getAllClinicalEntries());
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load clinical entries.");
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

  return { entries, loading, error, loadEntries, reviewClinicalEntry };
}
