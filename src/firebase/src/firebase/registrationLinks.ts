import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { AppUser } from "../models/User";
import type { RegistrationLink } from "../models/RegistrationLink";

const LINKS = "registrationLinks";
const ENROLLMENTS = "registrationLinkEnrollments";

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
    institutionId: input.institutionId || profile.institutionId,
    institutionName: input.institutionName || profile.institutionName,
    courseUnitIds: input.courseUnitIds || [],
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

export async function getMyRegistrationLinks(userId: string): Promise<RegistrationLink[]> {
  const snapshot = await getDocs(query(collection(db, LINKS), where("createdByUid", "==", userId), orderBy("createdAt", "desc"), limit(100)));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as RegistrationLink));
}

export async function setRegistrationLinkStatus(code: string, status: RegistrationLink["status"]): Promise<void> {
  await updateDoc(doc(db, LINKS, code), { status, updatedAt: serverTimestamp() });
}

export async function claimRegistrationLink(code: string, profile: AppUser): Promise<"approved" | "pending"> {
  if (profile.role !== "student") throw new Error("Registration links can only be claimed by student accounts.");

  return runTransaction(db, async (transaction) => {
    const linkRef = doc(db, LINKS, code);
    const userRef = doc(db, "users", profile.uid);
    const claimRef = doc(db, ENROLLMENTS, `${code}_${profile.uid}`);
    const [linkSnapshot, claimSnapshot] = await Promise.all([
      transaction.get(linkRef),
      transaction.get(claimRef),
    ]);

    if (!linkSnapshot.exists()) throw new Error("This registration link does not exist.");
    const link = linkSnapshot.data() as RegistrationLink;
    if (link.status !== "active") throw new Error("This registration link is not active.");

    const expiry = link.expiresAt && "toDate" in link.expiresAt ? link.expiresAt.toDate() : link.expiresAt;
    if (expiry instanceof Date && expiry.getTime() < Date.now()) throw new Error("This registration link has expired.");
    if (link.maximumRegistrations && link.registrationCount >= link.maximumRegistrations) throw new Error("This registration link has reached its registration limit.");

    if (claimSnapshot.exists()) {
      return (claimSnapshot.data().approvalStatus || "approved") as "approved" | "pending";
    }

    const conflictingInstitution = Boolean(profile.institutionId && link.institutionId && profile.institutionId !== link.institutionId);
    const approvalStatus: "approved" | "pending" = link.requiresApproval || conflictingInstitution ? "pending" : "approved";

    transaction.set(claimRef, clean({
      id: claimRef.id,
      registrationLinkId: code,
      registrationLinkCode: code,
      studentAuthUid: profile.uid,
      studentEmail: profile.email.toLowerCase(),
      studentName: profile.fullName,
      institutionId: link.institutionId,
      tutorId: link.tutorId,
      programmeId: link.programmeId,
      academicYear: link.academicYear,
      yearOfStudy: link.yearOfStudy,
      semester: link.semester,
      studentGroupId: link.studentGroupId,
      courseUnitIds: link.courseUnitIds || [],
      approvalStatus,
      joinedAt: serverTimestamp(),
    }));

    transaction.update(linkRef, { registrationCount: increment(1), updatedAt: serverTimestamp() });

    if (approvalStatus === "approved") {
      const linkedTutorIds = Array.from(new Set([...(profile.linkedTutorIds || []), ...(link.tutorId ? [link.tutorId] : [])]));
      const programmeIds = Array.from(new Set([...(profile.programmeIds || []), ...(link.programmeId ? [link.programmeId] : [])]));
      const assignedCourseUnitIds = Array.from(new Set([...(profile.assignedCourseUnitIds || []), ...(link.courseUnitIds || [])]));
      transaction.update(userRef, clean({
        institutionId: profile.institutionId || link.institutionId,
        institutionName: profile.institutionName || link.institutionName,
        linkedTutorIds,
        programmeIds,
        assignedCourseUnitIds,
        academicYear: link.academicYear || profile.academicYear,
        yearOfStudy: link.yearOfStudy || profile.yearOfStudy,
        semester: link.semester || profile.semester,
        studentGroupId: link.studentGroupId || profile.studentGroupId,
        onboardingSource: "registration-link",
        registrationLinkId: code,
        updatedAt: serverTimestamp(),
      }));
    }

    return approvalStatus;
  });
}
