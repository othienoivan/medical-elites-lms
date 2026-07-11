import {
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
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

export async function synchronizeStudentIdentity(
  authUid: string,
  email?: string | null
): Promise<IdentitySyncResult> {
  const normalizedEmail = normalizeEmail(email);

  const byUid = await getDocs(
    query(collection(db, "students"), where("authUid", "==", authUid))
  );

  let studentDoc = byUid.docs[0];
  let linkedStudent = false;

  if (!studentDoc && normalizedEmail) {
    const byEmail = await getDocs(
      query(collection(db, "students"), where("emailNormalized", "==", normalizedEmail))
    );

    studentDoc = byEmail.docs[0];

    if (!studentDoc) {
      const legacyEmailMatch = await getDocs(
        query(collection(db, "students"), where("email", "==", email || ""))
      );
      studentDoc = legacyEmailMatch.docs[0];
    }
  }

  if (!studentDoc) {
    return { student: null, linkedStudent: false, linkedEnrollments: 0 };
  }

  const studentData = studentDoc.data() as Omit<Student, "id">;
  const existingUid = studentData.authUid?.trim();

  if (existingUid && existingUid !== authUid) {
    throw new Error(
      "This student record is already linked to a different login account."
    );
  }

  if (!existingUid || studentData.emailNormalized !== normalizedEmail) {
    await updateDoc(doc(db, "students", studentDoc.id), {
      authUid,
      emailNormalized: normalizedEmail,
      identityLinkedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    linkedStudent = !existingUid;
  }

  const enrollmentSnapshots = await Promise.all([
    getDocs(
      query(
        collection(db, "enrollments"),
        where("studentId", "==", studentDoc.id)
      )
    ),
    normalizedEmail
      ? getDocs(
          query(
            collection(db, "enrollments"),
            where("studentEmailNormalized", "==", normalizedEmail)
          )
        )
      : Promise.resolve(null),
  ]);

  const enrollmentDocs = new Map<
    string,
    QueryDocumentSnapshot<DocumentData>
  >();
  enrollmentSnapshots[0].docs.forEach((item) => enrollmentDocs.set(item.id, item));
  enrollmentSnapshots[1]?.docs.forEach((item) => enrollmentDocs.set(item.id, item));

  const batch = writeBatch(db);
  let linkedEnrollments = 0;

  enrollmentDocs.forEach((item) => {
    const data = item.data();
    if (data.studentAuthUid !== authUid || data.userId !== authUid) {
      batch.update(item.ref, {
        studentAuthUid: authUid,
        userId: authUid,
        studentEmailNormalized: normalizedEmail,
        identityLinkedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      linkedEnrollments += 1;
    }
  });

  if (linkedEnrollments > 0) {
    await batch.commit();
  }

  return {
    student: {
      ...studentData,
      id: studentDoc.id,
      authUid,
      emailNormalized: normalizedEmail,
    },
    linkedStudent,
    linkedEnrollments,
  };
}
