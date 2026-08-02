import type { CourseUnit } from "../models/CourseUnit";

const romanNumbers: Record<string, number> = {
  i: 1, ii: 2, iii: 3, iv: 4, v: 5, vi: 6,
};

export function academicNumber(value?: string | number | null): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value) return null;

  const normalized = String(value).trim().toLowerCase();
  const digitMatch = normalized.match(/\d+/);
  if (digitMatch) return Number(digitMatch[0]);

  const romanMatch = normalized.match(/(?:semester|sem|year)?\s*(vi|iv|v|iii|ii|i)\b/);
  return romanMatch ? romanNumbers[romanMatch[1]] ?? null : null;
}

export function matchesAcademicPlacement(
  course: CourseUnit,
  programmeId?: string,
  yearOfStudy?: string | number,
  semester?: string | number
): boolean {
  if (!programmeId || course.programmeId !== programmeId) return false;
  const selectedYear = academicNumber(yearOfStudy);
  const selectedSemester = academicNumber(semester);
  const courseYear = academicNumber(course.yearOfStudy);
  const courseSemester = academicNumber(course.semester);

  return (selectedYear == null || courseYear == null || selectedYear === courseYear)
    && (selectedSemester == null || courseSemester == null || selectedSemester === courseSemester);
}

export function suggestedCourseUnitIds(
  courses: CourseUnit[],
  programmeId?: string,
  yearOfStudy?: string | number,
  semester?: string | number
): string[] {
  return courses
    .filter((course) => matchesAcademicPlacement(course, programmeId, yearOfStudy, semester))
    .map((course) => course.id);
}
