import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import { db } from "../config/firebase";
import type { AppUser } from "../models/User";

export async function getTutorAccounts(): Promise<AppUser[]> {
  const snapshot = await getDocs(
    query(collection(db, "users"), where("role", "==", "tutor"))
  );

  return snapshot.docs
    .map((item) => ({ ...item.data(), uid: item.id } as AppUser))
    .sort((a, b) => a.fullName.localeCompare(b.fullName));
}

export async function setUserActive(uid: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, "users", uid), { isActive });
}
