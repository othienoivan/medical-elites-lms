import { useCallback, useEffect, useState } from "react";

export function usePlatformRecords<T>(loader: () => Promise<T[]>) {
  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { setRecords(await loader()); }
    catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to load platform records."); }
    finally { setLoading(false); }
  }, [loader]);
  useEffect(() => { void refresh(); }, [refresh]);
  return { records, loading, error, refresh, setRecords };
}
