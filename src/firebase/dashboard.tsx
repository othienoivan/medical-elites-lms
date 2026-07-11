import { getUserEnrollments } from "./enrollments";

export async function getDashboardData(userId: string) {
  const enrollments = await getUserEnrollments(userId);

  const totalCourses = enrollments.length;

  const overallProgress =
    totalCourses === 0
      ? 0
      : Math.round(
<<<<<<< HEAD
          enrollments.reduce((sum, item) => sum + (item.progress ?? 0), 0) /
=======
          enrollments.reduce((sum, item) => sum + item.progress, 0) /
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
            totalCourses
        );

  return {
    enrollments,
    totalCourses,
    overallProgress,
  };
}