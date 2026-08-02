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
  moduleIds?: string[];
  approvalStatus?: "approved" | "pending" | "rejected";
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
  startedModules?: string[];
  unlockedModules?: string[];
  enrolledAt?: Date;

  status: EnrollmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
