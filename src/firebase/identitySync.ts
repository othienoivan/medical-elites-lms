import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { Student } from "../models/Student";

export type IdentitySyncResult = {
  student: Student | null;
  linkedStudent: boolean;
  linkedEnrollments: number;
};

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || "";
}

/**
 * Synchronizes only the authenticated learner's canonical records.
 *
 * Student documents use the Firebase Auth UID as their Firestore document ID.
 * Direct document reads align with the security rule studentId == request.auth.uid
 * and avoid collection-wide identity discovery queries that Firestore correctly
 * rejects for student accounts.
 */
export async function synchronizeStudentIdentity(
  authUid: string,
  email?: string | null
): Promise<IdentitySyncResult> {
  const normalizedEmail = normalizeEmail(email);
  const studentRef = doc(db, "students", authUid);
  const studentSnapshot = await getDoc(studentRef);

  if (!studentSnapshot.exists()) {
    return { student: null, linkedStudent: false, linkedEnrollments: 0 };
  }

  const studentData = studentSnapshot.data() as Omit<Student, "id">;
  const existingUid = studentData.authUid?.trim();

  if (existingUid && existingUid !== authUid) {
    throw new Error("This student record is already linked to a different login account.");
  }

  const identityPatch: Record<string, unknown> = {};
  if (!existingUid) identityPatch.authUid = authUid;
  if (studentData.emailNormalized !== normalizedEmail) {
    identityPatch.emailNormalized = normalizedEmail;
  }

  const linkedStudent = Object.keys(identityPatch).length > 0;
  if (linkedStudent) {
    await updateDoc(studentRef, {
      ...identityPatch,
      identityLinkedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await setDoc(
    doc(db, "users", authUid),
    {
      programmeIds: studentData.programmeId ? [studentData.programmeId] : [],
      assignedCourseUnitIds: studentData.assignedCourseUnitIds || [],
      academicYear: studentData.academicYear || null,
      yearOfStudy: studentData.yearOfStudy || null,
      semester: studentData.semester || null,
      institutionId: studentData.institutionId || null,
      linkedTutorIds: studentData.assignedTutorIds || [],
      studentRecordId: authUid,
      academicAccessSyncedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return {
    student: {
      ...studentData,
      id: authUid,
      authUid,
      emailNormalized: normalizedEmail,
    },
    linkedStudent,
    linkedEnrollments: 0,
  };
}
