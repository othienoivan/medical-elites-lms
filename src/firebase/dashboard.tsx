import { getUserEnrollments } from "./enrollments";

export async function getDashboardData(userId: string) {
  const enrollments = await getUserEnrollments(userId);

  const totalCourses = enrollments.length;

  const overallProgress =
    totalCourses === 0
      ? 0
      : Math.round(
          enrollments.reduce((sum, item) => sum + item.progress, 0) /
            totalCourses
        );

  return {
    enrollments,
    totalCourses,
    overallProgress,
  };
}