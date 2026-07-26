import { useEffect, useState } from "react";
import { getAllModules, getModules } from "../firebase/modules";
import type { Module } from "../models/Module";
import useAccessScope from "./useAccessScope";

export default function useModules(courseUnitId?: string, includeUnpublished = false) {
  const scope = useAccessScope();
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!scope) return;
    const activeScope = scope;
    void (includeUnpublished ? getAllModules(activeScope) : getModules(activeScope)).then((data)=>setModules(courseUnitId ? data.filter((m)=>m.courseUnitId===courseUnitId || m.courseId===courseUnitId) : data)).catch((e)=>{console.error("Failed to load modules:",e);setModules([]);}).finally(()=>setLoading(false));
  }, [scope, courseUnitId, includeUnpublished]);
  return { modules, loading };
}
