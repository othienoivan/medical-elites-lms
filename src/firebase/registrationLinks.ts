import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  limit,
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

export async function claimRegistrationLink(code: string, profile: AppUser): Promise<"approved" | "pending"> {
  if (profile.role !== "student") throw new Error("Registration links can only be claimed by student accounts.");

  return runTransaction(db, async (transaction) => {
    const linkRef = doc(db, LINKS, code);
    const userRef = doc(db, "users", profile.uid);
    const claimRef = doc(db, ENROLLMENTS, `${code}_${profile.uid}`);
    // One authenticated learner has one canonical School Management record.
    // This makes registration-link claims idempotent and repairs earlier claims
    // that created an enrollment but omitted the students collection record.
    const studentRef = doc(db, "students", profile.uid);
    const [linkSnapshot, claimSnapshot, studentSnapshot] = await Promise.all([
      transaction.get(linkRef),
      transaction.get(claimRef),
      transaction.get(studentRef),
    ]);

    if (!linkSnapshot.exists()) throw new Error("This registration link does not exist.");
    const link = linkSnapshot.data() as RegistrationLink;
    if (link.status !== "active") throw new Error("This registration link is not active.");

    const expiry = link.expiresAt && "toDate" in link.expiresAt ? link.expiresAt.toDate() : link.expiresAt;
    if (expiry instanceof Date && expiry.getTime() < Date.now()) throw new Error("This registration link has expired.");
    if (!claimSnapshot.exists() && link.maximumRegistrations && link.registrationCount >= link.maximumRegistrations) {
      throw new Error("This registration link has reached its registration limit.");
    }

    const conflictingInstitution = Boolean(profile.institutionId && link.institutionId && profile.institutionId !== link.institutionId);
    const existingApprovalStatus = claimSnapshot.exists()
      ? (claimSnapshot.data().approvalStatus as "approved" | "pending" | undefined)
      : undefined;
    const approvalStatus: "approved" | "pending" = existingApprovalStatus
      || (link.requiresApproval || conflictingInstitution ? "pending" : "approved");

    const owningTutorId = link.tutorId || link.createdByUid;
    const linkedTutorIds = Array.from(new Set([...(profile.linkedTutorIds || []), owningTutorId]));
    const programmeIds = Array.from(new Set([...(profile.programmeIds || []), ...(link.programmeId ? [link.programmeId] : [])]));
    const assignedCourseUnitIds = Array.from(new Set([...(profile.assignedCourseUnitIds || []), ...(link.courseUnitIds || [])]));

    if (!claimSnapshot.exists()) {
      transaction.set(claimRef, clean({
        id: claimRef.id,
        registrationLinkId: code,
        registrationLinkCode: code,
        studentAuthUid: profile.uid,
        studentEmail: profile.email.toLowerCase(),
        studentName: profile.fullName,
        institutionId: link.institutionId,
        tutorId: owningTutorId,
        programmeId: link.programmeId,
        academicYear: link.academicYear,
        yearOfStudy: link.yearOfStudy,
        semester: link.semester,
        studentGroupId: link.studentGroupId,
        courseUnitIds: link.courseUnitIds || [],
        moduleIds: link.moduleIds || [],
        approvalStatus,
        joinedAt: serverTimestamp(),
      }));
      transaction.update(linkRef, { registrationCount: increment(1), updatedAt: serverTimestamp() });
    }

    if (!studentSnapshot.exists()) {
      transaction.set(studentRef, clean({
        authUid: profile.uid,
        ownerUserId: owningTutorId,
        createdByUid: owningTutorId,
        registeredByRole: link.ownerRole,
        institutionId: link.institutionId || null,
        assignedTutorIds: linkedTutorIds,
        assignedCourseUnitIds,
        onboardingSource: "registration-link",
        registrationLinkId: code,
        emailNormalized: profile.email.trim().toLowerCase(),
        fullName: profile.fullName,
        gender: "",
        dateOfBirth: "",
        nationalId: "",
        registrationNumber: "",
        studentNumber: profile.uid,
        programmeId: link.programmeId || "",
        programmeTitle: link.programmeTitle || "",
        academicYear: link.academicYear || "",
        intake: "",
        yearOfStudy: link.yearOfStudy || "",
        semester: link.semester || "",
        email: profile.email.trim(),
        phone: "",
        guardianName: "",
        guardianPhone: "",
        emergencyContact: "",
        sponsor: "",
        admissionDate: new Date().toISOString().slice(0, 10),
        status: approvalStatus === "approved" ? "active" : "deferred",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        identityLinkedAt: serverTimestamp(),
      }));
    } else {
      transaction.update(studentRef, clean({
        authUid: profile.uid,
        institutionId: link.institutionId || studentSnapshot.data().institutionId || null,
        assignedTutorIds: Array.from(new Set([...(studentSnapshot.data().assignedTutorIds || []), ...linkedTutorIds])),
        assignedCourseUnitIds: Array.from(new Set([...(studentSnapshot.data().assignedCourseUnitIds || []), ...assignedCourseUnitIds])),
        programmeId: link.programmeId || studentSnapshot.data().programmeId,
        programmeTitle: link.programmeTitle || studentSnapshot.data().programmeTitle,
        academicYear: link.academicYear || studentSnapshot.data().academicYear,
        yearOfStudy: link.yearOfStudy || studentSnapshot.data().yearOfStudy,
        semester: link.semester || studentSnapshot.data().semester,
        onboardingSource: "registration-link",
        registrationLinkId: code,
        email: profile.email.trim(),
        emailNormalized: profile.email.trim().toLowerCase(),
        identityLinkedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }));
    }

    if (approvalStatus === "approved") {
      transaction.update(userRef, clean({
        institutionId: profile.institutionId || link.institutionId || null,
        institutionName: profile.institutionName || link.institutionName,
        linkedTutorIds,
        programmeIds,
        assignedCourseUnitIds,
        academicYear: link.academicYear || profile.academicYear,
        yearOfStudy: link.yearOfStudy || profile.yearOfStudy,
        semester: link.semester || profile.semester,
        studentGroupId: link.studentGroupId || profile.studentGroupId,
        studentRecordId: profile.uid,
        onboardingSource: "registration-link",
        registrationLinkId: code,
        updatedAt: serverTimestamp(),
      }));
    }

    return approvalStatus;
  });
}
