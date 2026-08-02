import { useEffect, useState } from "react";
import { getAllProgrammes, getProgrammes } from "../firebase/programmes";
import type { Programme } from "../models/Programme";
import useAccessScope from "./useAccessScope";

export default function useProgrammes(includeUnpublished = false) {
  const scope = useAccessScope();
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scope) return;
    const activeScope = scope;
    async function loadProgrammes() {
      try {
        setLoading(true);
        setProgrammes(includeUnpublished ? await getAllProgrammes(activeScope) : await getProgrammes(activeScope));
      } catch (error) {
        console.error("Failed to load programmes:", error);
        setProgrammes([]);
      } finally {
        setLoading(false);
      }
    }
    void loadProgrammes();
  }, [scope, includeUnpublished]);

  return { programmes, loading };
}
