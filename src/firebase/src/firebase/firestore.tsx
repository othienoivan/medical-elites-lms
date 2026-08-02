import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

type CreateUserProfileData = {
  uid: string;
  fullName: string;
  email: string;
  role?: "student" | "tutor" | "admin";
  requestedRole?: "student" | "tutor" | "admin";
  isActive?: boolean;
  onboardingSource?: "direct" | "registration-link" | "admin" | "tutor";
  registrationLinkId?: string;
};

export async function createUserProfile({
  uid,
  fullName,
  email,
  role = "student",
  requestedRole = role,
  isActive = true,
  onboardingSource = "direct",
  registrationLinkId,
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
    onboardingSource,
    ...(registrationLinkId ? { registrationLinkId } : {}),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
