import { useEffect, useState } from "react";
import { getModules } from "../firebase/modules";
import type { Module } from "../models/Module";

export default function useModules(courseUnitId?: string) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModules() {
      try {
        const data = await getModules();
        setModules(
          courseUnitId
            ? data.filter(
                (item) =>
                  item.courseUnitId === courseUnitId || item.courseId === courseUnitId
              )
            : data
        );
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setLoading(false);
      }
    }

    loadModules();
  }, [courseUnitId]);

  return { modules, loading };
}
