import { useEffect, useState } from "react";
import { getModules } from "../firebase/modules";
import type { Module } from "../models/Module";

<<<<<<< HEAD
export default function useModules(courseUnitId?: string) {
=======
export default function useModules() {
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadModules() {
      try {
        const data = await getModules();
<<<<<<< HEAD
        setModules(
          courseUnitId
            ? data.filter(
                (item) =>
                  item.courseUnitId === courseUnitId || item.courseId === courseUnitId
              )
            : data
        );
=======
        setModules(data);
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
      } catch (error) {
        console.error("Failed to load modules:", error);
      } finally {
        setLoading(false);
      }
    }

    loadModules();
<<<<<<< HEAD
  }, [courseUnitId]);

  return { modules, loading };
}
=======
  }, []);

  return { modules, loading };
}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
