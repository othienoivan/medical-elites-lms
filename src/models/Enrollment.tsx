<<<<<<< HEAD
export type EnrollmentStatus = "active" | "inactive" | "completed" | "transferred";

export interface Enrollment {
  id: string;

  // Student information system enrolment fields
  studentId?: string;
  studentAuthUid?: string;
  studentEmailNormalized?: string;
  identityLinkedAt?: Date;
  studentName?: string;
  registrationNumber?: string;
  programmeId?: string;
  programmeTitle?: string;
  courseUnitIds?: string[];
  academicYear?: string;
  semester?: string;
  intake?: string;
  classGroup?: string;

  // Legacy learner-course enrolment fields used by the student dashboard
  userId?: string;
  courseId?: string;
  courseSlug?: string;
  courseTitle?: string;
  progress?: number;
  completedModules?: string[];
  unlockedModules?: string[];
  enrolledAt?: Date;

  status: EnrollmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
=======
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
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
