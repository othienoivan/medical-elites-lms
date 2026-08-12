import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db, functions } from "../config/firebase";
import { httpsCallable } from "firebase/functions";
import type { AppUser } from "../models/User";
import type { RegistrationLink } from "../models/RegistrationLink";

const LINKS = "registrationLinks";

function generateCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(18));
  return Array.from(bytes, (value) => value.toString(36).padStart(2, "0")).join("").slice(0, 28);
}

function clean<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== "")) as T;
}

export async function createRegistrationLink(
  profile: AppUser,
  input: Omit<RegistrationLink, "id" | "code" | "createdByUid" | "ownerRole" | "registrationCount" | "createdAt" | "updatedAt">
): Promise<RegistrationLink> {
  if (profile.role !== "tutor" && profile.role !== "admin") throw new Error("Only tutors and administrators can create registration links.");

  const code = generateCode();
  const reference = doc(db, LINKS, code);
  const payload = clean({
    ...input,
    id: code,
    code,
    createdByUid: profile.uid,
    ownerRole: profile.role,
    tutorId: profile.role === "tutor" ? profile.uid : input.tutorId,
    tutorName: profile.role === "tutor" ? profile.fullName : input.tutorName,
    // Tutor-created registration links are tutor-owned by design. They must
    // never attach learners to an institution, even if the tutor profile still
    // carries legacy institution metadata. Admin-created links may be institutional.
    institutionId: profile.role === "tutor" ? undefined : (input.institutionId || profile.institutionId),
    institutionName: profile.role === "tutor" ? undefined : (input.institutionName || profile.institutionName),
    courseUnitIds: input.courseUnitIds || [],
    moduleIds: input.moduleIds || [],
    registrationCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await setDoc(reference, payload);
  return { ...(payload as unknown as RegistrationLink), id: code, code };
}

export async function getRegistrationLink(code: string): Promise<RegistrationLink | null> {
  const snapshot = await getDoc(doc(db, LINKS, code));
  return snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as RegistrationLink) : null;
}

function timestampMillis(value: unknown): number {
  if (value && typeof value === "object" && "toMillis" in value && typeof (value as { toMillis?: unknown }).toMillis === "function") {
    return (value as { toMillis: () => number }).toMillis();
  }
  if (value instanceof Date) return value.getTime();
  return 0;
}

export async function getMyRegistrationLinks(userId: string): Promise<RegistrationLink[]> {
  if (!userId) return [];

  // Avoid a composite index dependency. Ownership is constrained in Firestore;
  // presentation ordering is handled locally after retrieval.
  const snapshot = await getDocs(
    query(collection(db, LINKS), where("createdByUid", "==", userId), limit(100))
  );

  return snapshot.docs
    .map((item) => ({ ...item.data(), id: item.id } as RegistrationLink))
    .sort((a, b) => timestampMillis(b.createdAt) - timestampMillis(a.createdAt));
}

export async function setRegistrationLinkStatus(code: string, status: RegistrationLink["status"]): Promise<void> {
  await updateDoc(doc(db, LINKS, code), { status, updatedAt: serverTimestamp() });
}

export type TutorRegistrationLinkStudent = {
  enrollmentId: string;
  registrationLinkCode: string;
  registrationLinkName?: string;
  registrationLinkType?: string;
  studentAuthUid: string;
  studentName: string;
  studentEmail: string;
  approvalStatus: "approved" | "pending" | "rejected";
  programmeId?: string;
  academicYear?: string;
  yearOfStudy?: string;
  semester?: string;
  courseUnitIds: string[];
  joinedAt?: unknown;
};

export async function claimRegistrationLink(code: string, profile: AppUser): Promise<"approved" | "pending"> {
  if (profile.role !== "student") throw new Error("Registration links can only be claimed by student accounts.");
  const callable = httpsCallable<{ code: string }, { approvalStatus: "approved" | "pending" }>(
    functions,
    "claimRegistrationLinkTrusted",
  );
  const result = await callable({ code });
  return result.data.approvalStatus;
}

export async function getTutorRegistrationLinkStudents(): Promise<TutorRegistrationLinkStudent[]> {
  const callable = httpsCallable<Record<string, never>, { students: TutorRegistrationLinkStudent[] }>(
    functions,
    "getTutorRegistrationLinkStudents",
  );
  const result = await callable({});
  return result.data.students ?? [];
}
