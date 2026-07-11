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
<<<<<<< HEAD
    isActive: true,
=======
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}