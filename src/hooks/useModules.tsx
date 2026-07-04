import { useEffect, useState } from "react";
import { getModules } from "../firebase/modules";
import type { Module } from "../models/Module";

export default function useModules(courseId?: string) {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModules() {
      if (!courseId) return;

      try {
        const data = await getModules(courseId);
        setModules(data);
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setLoading(false);
      }
    }

    loadModules();
  }, [courseId]);

  return { modules, loading };
}