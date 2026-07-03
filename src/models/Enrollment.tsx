export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  status: "active" | "completed" | "dropped";
  progress: number;
  completedModules: string[];
  unlockedModules: string[];
  enrolledAt?: Date;
  completedAt?: Date;
}