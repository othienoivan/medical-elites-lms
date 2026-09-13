import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";

import useCourseUnits from "./useCourseUnits";
import useStudents from "./useStudents";
import useAuth from "./useAuth";
import useTenant from "./useTenant";
import { db } from "../config/firebase";

type StorageUsage = {
  usedBytes: number;
  reservedBytes: number;
  objectCount: number;
};

const EMPTY_STORAGE: StorageUsage = {
  usedBytes: 0,
  reservedBytes: 0,
  objectCount: 0,
};

export default function useTutorPlanUsage() {
  const { currentUser } = useAuth();
  const { activeTenant } = useTenant();
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits(true);
  const { students, loading: studentsLoading } = useStudents();

  const [storage, setStorage] = useState<StorageUsage>(EMPTY_STORAGE);
  const [storageLoading, setStorageLoading] = useState(true);

  useEffect(() => {
    const tenantId =
      activeTenant?.id ??
      currentUser?.uid ??
      null;

    if (!tenantId) {
      setStorage(EMPTY_STORAGE);
      setStorageLoading(false);
      return;
    }

    setStorageLoading(true);

    const usageRef = doc(db, "tenantStorageUsage", tenantId);

    const unsubscribe = onSnapshot(
      usageRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setStorage(EMPTY_STORAGE);
        } else {
          const data = snapshot.data();

          setStorage({
            usedBytes: Number(data.usedBytes ?? 0),
            reservedBytes: Number(data.reservedBytes ?? 0),
            objectCount: Number(data.objectCount ?? 0),
          });
        }

        setStorageLoading(false);
      },
      (error) => {
        console.error("Failed to load storage usage:", error);
        setStorage(EMPTY_STORAGE);
        setStorageLoading(false);
      },
    );

    return unsubscribe;
  }, [activeTenant?.id, currentUser?.uid]);

  return useMemo(
    () => ({
      usage: {
        courseUnits: courseUnits.length,
        students: students.length,
        storageBytes: storage.usedBytes,
        storageReservedBytes: storage.reservedBytes,
        storageObjectCount: storage.objectCount,
      },
      loading:
        courseUnitsLoading ||
        studentsLoading ||
        storageLoading,
    }),
    [
      courseUnits.length,
      courseUnitsLoading,
      students.length,
      studentsLoading,
      storage.usedBytes,
      storage.reservedBytes,
      storage.objectCount,
      storageLoading,
    ],
  );
}
