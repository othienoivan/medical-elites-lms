import { useEffect, useState } from "react";
import { getModules } from "../firebase/modules";
import { getLessons } from "../firebase/lessons";
import useAccessScope from "./useAccessScope";

export default function useCourseUnitContentStats(courseUnitId?: string) {
  const scope = useAccessScope();
  const [modules, setModules] = useState(0);
  const [lessons, setLessons] = useState(0);
  const [lessonCounts, setLessonCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!scope || !courseUnitId) { setModules(0); setLessons(0); setLessonCounts({}); setLoading(false); return; }
    let active = true;
    setLoading(true);
    void getModules(scope).then(async rows => {
      const relevant = rows.filter(item => item.courseUnitId === courseUnitId || item.courseId === courseUnitId);
      const results = await Promise.all(relevant.map(async module => [module.id, (await getLessons(module.id, scope)).length] as const));
      if (!active) return;
      const counts = Object.fromEntries(results);
      setModules(relevant.length); setLessonCounts(counts); setLessons(results.reduce((sum, [,count])=>sum+count,0));
    }).catch(error => { console.error("Failed to calculate course content statistics", error); if(active){setModules(0);setLessons(0);setLessonCounts({});} }).finally(()=>{if(active)setLoading(false)});
    return () => { active = false; };
  }, [scope, courseUnitId]);

  return { modules, lessons, lessonCounts, loading };
}
