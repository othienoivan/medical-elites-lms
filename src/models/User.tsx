<<<<<<< HEAD
import type { Timestamp } from "firebase/firestore";

export type UserRole = "student" | "tutor" | "admin";

export interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  profilePhoto?: string;
  enrolledCourses: string[];
  isActive: boolean;
  createdAt?: Date | Timestamp | null;
  updatedAt?: Date | Timestamp | null;
}

// Backward-compatible alias for existing imports.
export type User = AppUser;
=======
export interface User {
  uid: string;
  fullName: string;
  email: string;

  role: "student" | "tutor" | "admin";

  profilePhoto?: string;

  enrolledCourses: string[];

  createdAt: Date;
}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
