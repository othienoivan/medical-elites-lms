export interface User {
  uid: string;
  fullName: string;
  email: string;

  role: "student" | "tutor" | "admin";

  profilePhoto?: string;

  enrolledCourses: string[];

  createdAt: Date;
}