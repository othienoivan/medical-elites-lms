import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

type CreateUserProfileData = {
  uid: string;
  fullName: string;
  email: string;
  role?: "student" | "tutor" | "admin";
  requestedRole?: "student" | "tutor" | "admin";
  isActive?: boolean;
};

export async function createUserProfile({
  uid,
  fullName,
  email,
  role = "student",
  requestedRole = role,
  isActive = true,
}: CreateUserProfileData) {
  const userRef = doc(db, "users", uid);

  await setDoc(userRef, {
    uid,
    fullName,
    email,
    role,
    requestedRole,
    profilePhoto: "",
    enrolledCourses: [],
    isActive,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
