import { useMemo } from "react";

import useCourseUnits from "./useCourseUnits";
import useStudents from "./useStudents";

export default function useTutorPlanUsage() {
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits(true);
  const { students, loading: studentsLoading } = useStudents();

  return useMemo(() => ({
    usage: {
      courseUnits: courseUnits.length,
      students: students.length,
    },
    loading: courseUnitsLoading || studentsLoading,
  }), [courseUnits.length, courseUnitsLoading, students.length, studentsLoading]);
}
