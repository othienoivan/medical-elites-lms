import { useEffect, useState } from "react";
import { getProgrammes } from "../firebase/programmes";
import type { Programme } from "../models/Programme";

export default function useProgrammes() {
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProgrammes() {
      try {
        const data = await getProgrammes();
        setProgrammes(data);
      } catch (error) {
        console.error("Failed to load programmes:", error);
      } finally {
        setLoading(false);
      }
    }

    loadProgrammes();
  }, []);

  return { programmes, loading };
}