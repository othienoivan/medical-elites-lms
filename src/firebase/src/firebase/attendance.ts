import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type DocumentData,
  type QuerySnapshot,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type {
  AttendanceSession,
  StudentAttendanceEntry,
} from "../models/Attendance";

const SESSION_COLLECTION = "attendanceSessions";
const RECORD_COLLECTION = "attendanceRecords";

type NewAttendanceSession = Omit<
  AttendanceSession,
  "id" | "createdAt" | "updatedAt"
>;

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}

function normalizeEmail(value?: string | null) {
  return value?.trim().toLowerCase() || "";
}

function removeUndefinedValues<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => removeUndefinedValues(item)) as T;
  }

  if (value instanceof Date || value === null || typeof value !== "object") {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => [key, removeUndefinedValues(item)])
  ) as T;
}

function sessionFromSnapshot(
  id: string,
  data: Record<string, unknown>
): AttendanceSession {
  return {
    ...(data as unknown as AttendanceSession),
    id,
    records: Array.isArray(data.records)
      ? (data.records as AttendanceSession["records"])
      : [],
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

function recordFromSnapshot(
  id: string,
  data: Record<string, unknown>
): StudentAttendanceEntry {
  return {
    ...(data as unknown as StudentAttendanceEntry),
    id,
    createdAt: toDate(data.createdAt),
    updatedAt: toDate(data.updatedAt),
  };
}

export async function getAttendanceSessions(): Promise<AttendanceSession[]> {
  const snapshot = await getDocs(
    query(collection(db, SESSION_COLLECTION), orderBy("sessionDate", "desc"))
  );

  return snapshot.docs.map((item) =>
    sessionFromSnapshot(item.id, item.data())
  );
}

export async function getStudentAttendanceEntries(
  studentAuthUid: string,
  studentEmail?: string | null
): Promise<StudentAttendanceEntry[]> {
  const searches: Promise<QuerySnapshot<DocumentData>>[] = [];

  if (studentAuthUid) {
    searches.push(
      getDocs(
        query(
          collection(db, RECORD_COLLECTION),
          where("studentAuthUid", "==", studentAuthUid)
        )
      )
    );
  }

  const normalizedEmail = normalizeEmail(studentEmail);
  if (normalizedEmail) {
    searches.push(
      getDocs(
        query(
          collection(db, RECORD_COLLECTION),
          where("studentEmail", "==", normalizedEmail)
        )
      )
    );
  }

  const snapshots = await Promise.all(searches);
  const entries = new Map<string, StudentAttendanceEntry>();

  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((item) => {
      entries.set(item.id, recordFromSnapshot(item.id, item.data()));
    });
  });

  return [...entries.values()].sort((a, b) =>
    b.sessionDate.localeCompare(a.sessionDate)
  );
}

export async function saveAttendanceSession(
  session: NewAttendanceSession,
  sessionId?: string
): Promise<string> {
  const studentIds = session.records.map((record) => record.studentId);
  const studentAuthUids = session.records
    .map((record) => record.studentAuthUid)
    .filter((value): value is string => Boolean(value));
  const studentEmails = session.records
    .map((record) => normalizeEmail(record.studentEmail))
    .filter(Boolean);

  const normalizedRecords = session.records.map((record) =>
    removeUndefinedValues({
      ...record,
      studentAuthUid: record.studentAuthUid || "",
      studentEmail: normalizeEmail(record.studentEmail),
      note: record.note || "",
    })
  );

  const payload = removeUndefinedValues({
    ...session,
    records: normalizedRecords,
    courseUnitCode: session.courseUnitCode ?? "",
    programmeId: session.programmeId ?? "",
    programmeTitle: session.programmeTitle ?? "",
    studentIds,
    studentAuthUids: [...new Set(studentAuthUids)],
    studentEmails: [...new Set(studentEmails)],
    updatedAt: serverTimestamp(),
  });

  let resolvedSessionId = sessionId;

  if (resolvedSessionId) {
    await updateDoc(doc(db, SESSION_COLLECTION, resolvedSessionId), payload);
  } else {
    const reference = await addDoc(collection(db, SESSION_COLLECTION), {
      ...payload,
      createdAt: serverTimestamp(),
    });
    resolvedSessionId = reference.id;
  }

  const batch = writeBatch(db);

  normalizedRecords.forEach((record) => {
    const recordId = `${resolvedSessionId}_${record.studentId}`;
    const recordRef = doc(db, RECORD_COLLECTION, recordId);

    batch.set(
      recordRef,
      removeUndefinedValues({
        sessionId: resolvedSessionId,
        studentId: record.studentId,
        studentAuthUid: record.studentAuthUid || "",
        studentEmail: normalizeEmail(record.studentEmail),
        studentName: record.studentName,
        registrationNumber: record.registrationNumber || "",
        courseUnitId: session.courseUnitId,
        courseUnitTitle: session.courseUnitTitle,
        courseUnitCode: session.courseUnitCode || "",
        sessionDate: session.sessionDate,
        lessonTitle: session.lessonTitle,
        status: record.status,
        note: record.note || "",
        markedByUid: session.markedByUid,
        markedByName: session.markedByName,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      }),
      { merge: true }
    );
  });

  await batch.commit();
  return resolvedSessionId;
}

export async function repairAttendanceIdentityLinks(
  students: Array<{ id: string; authUid?: string; email?: string }>
): Promise<number> {
  const identityByStudentId = new Map(
    students.map((student) => [
      student.id,
      {
        authUid: student.authUid || "",
        email: normalizeEmail(student.email),
      },
    ])
  );

  const snapshot = await getDocs(collection(db, SESSION_COLLECTION));
  let repaired = 0;

  for (const item of snapshot.docs) {
    const session = sessionFromSnapshot(item.id, item.data());
    let changed = false;

    const records = session.records.map((record) => {
      const identity = identityByStudentId.get(record.studentId);
      if (!identity) return record;

      const nextAuthUid = record.studentAuthUid || identity.authUid;
      const nextEmail = normalizeEmail(record.studentEmail) || identity.email;

      if (
        nextAuthUid === (record.studentAuthUid || "") &&
        nextEmail === normalizeEmail(record.studentEmail)
      ) {
        return record;
      }

      changed = true;
      return {
        ...record,
        studentAuthUid: nextAuthUid,
        studentEmail: nextEmail,
      };
    });

    if (changed) {
      await updateDoc(doc(db, SESSION_COLLECTION, item.id), {
        records: removeUndefinedValues(records),
        studentIds: records.map((record) => record.studentId),
        studentAuthUids: [
          ...new Set(
            records
              .map((record) => record.studentAuthUid)
              .filter((value): value is string => Boolean(value))
          ),
        ],
        studentEmails: [
          ...new Set(
            records
              .map((record) => normalizeEmail(record.studentEmail))
              .filter(Boolean)
          ),
        ],
        updatedAt: serverTimestamp(),
      });
    }

    // Always mirror legacy session records into the flat attendanceRecords
    // collection so student attendance remains queryable even when the
    // identity fields were already correct.
    await Promise.all(
      records.map((record) =>
        setDoc(
          doc(db, RECORD_COLLECTION, `${item.id}_${record.studentId}`),
          removeUndefinedValues({
            sessionId: item.id,
            studentId: record.studentId,
            studentAuthUid: record.studentAuthUid || "",
            studentEmail: normalizeEmail(record.studentEmail),
            studentName: record.studentName,
            registrationNumber: record.registrationNumber || "",
            courseUnitId: session.courseUnitId,
            courseUnitTitle: session.courseUnitTitle,
            courseUnitCode: session.courseUnitCode || "",
            sessionDate: session.sessionDate,
            lessonTitle: session.lessonTitle,
            status: record.status,
            note: record.note || "",
            markedByUid: session.markedByUid,
            markedByName: session.markedByName,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
          }),
          { merge: true }
        )
      )
    );

    repaired += 1;
  }

  return repaired;
}
