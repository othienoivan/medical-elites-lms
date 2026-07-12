import type { Timestamp } from "firebase/firestore";

export type UserRole = "student" | "tutor" | "admin";

export interface AppUser {
  uid: string;
  fullName: string;
  email: string;
  role: UserRole;
  requestedRole?: UserRole;
  profilePhoto?: string;
  enrolledCourses: string[];
  isActive: boolean;
  createdAt?: Date | Timestamp | null;
  updatedAt?: Date | Timestamp | null;
}

// Backward-compatible alias for existing imports.
export type User = AppUser;
