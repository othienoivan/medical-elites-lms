import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

type CreateUserProfileData = {
  uid: string;
  fullName: string;
  email: string;
  role?: "student" | "tutor" | "admin";
};

export async function createUserProfile({
  uid,
  fullName,
  email,
  role = "student",
}: CreateUserProfileData) {
  const userRef = doc(db, "users", uid);

  await setDoc(userRef, {
    uid,
    fullName,
    email,
    role,
    profilePhoto: "",
    enrolledCourses: [],
    isActive: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}