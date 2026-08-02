import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";

import { db } from "../config/firebase";
import useAuth from "./useAuth";
import useModules from "./useModules";
import type { Enrollment } from "../models/Enrollment";
import type { Quiz } from "../models/Quiz";
import type { Student } from "../models/Student";

const ENROLLMENTS_COLLECTION = "enrollments";
const STUDENTS_COLLECTION = "students";

function mapEnrollment(id: string, data: Record<string, unknown>): Enrollment {
  return { ...(data as unknown as Enrollment), id };
}

async function runEnrollmentQuery(
  constraint: QueryConstraint
): Promise<Enrollment[]> {
  const snapshot = await getDocs(
    query(collection(db, ENROLLMENTS_COLLECTION), constraint)
  );

  return snapshot.docs.map((item) =>
    mapEnrollment(item.id, item.data())
  );
}

async function findStudentRecordsByEmail(email: string): Promise<Student[]> {
  if (!email.trim()) return [];

  const candidates = Array.from(
    new Set([email.trim(), email.trim().toLowerCase()])
  );

  const snapshots = await Promise.all(
    candidates.map((candidate) =>
      getDocs(
        query(
          collection(db, STUDENTS_COLLECTION),
          where("email", "==", candidate)
        )
      )
    )
  );

  const records = new Map<string, Student>();

  snapshots.forEach((snapshot) => {
    snapshot.docs.forEach((item) => {
      records.set(item.id, {
        ...(item.data() as Student),
        id: item.id,
      });
    });
  });

  return Array.from(records.values());
}

export default function useStudentLearningAccess() {
  const { currentUser, role } = useAuth();
  const { modules } = useModules();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentRecords, setStudentRecords] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAccess() {
      if (!currentUser) {
        if (active) {
          setEnrollments([]);
          setStudentRecords([]);
          setStudentRecords([]);
          setLoading(false);
        }
        return;
      }

      if (role === "tutor" || role === "admin") {
        if (active) {
          setEnrollments([]);
          setStudentRecords([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [sisEnrollments, legacyEnrollments, studentRecords] =
          await Promise.all([
            runEnrollmentQuery(
              where("studentAuthUid", "==", currentUser.uid)
            ),
            runEnrollmentQuery(where("userId", "==", currentUser.uid)),
            findStudentRecordsByEmail(currentUser.email || ""),
          ]);

        const studentIdEnrollmentGroups = await Promise.all(
          studentRecords.map((student) =>
            runEnrollmentQuery(where("studentId", "==", student.id))
          )
        );

        const merged = new Map<string, Enrollment>();

        [
          ...sisEnrollments,
          ...legacyEnrollments,
          ...studentIdEnrollmentGroups.flat(),
        ].forEach((item) => {
          merged.set(item.id, item);
        });

        if (active) {
          setStudentRecords(studentRecords);
          setEnrollments(
            Array.from(merged.values()).filter(
              (item) => item.status === "active"
            )
          );
        }
      } catch (loadError) {
        console.error("Failed to load student learning access:", loadError);
        if (active) {
          setError("Your academic enrolments could not be loaded.");
          setEnrollments([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAccess();

    return () => {
      active = false;
    };
  }, [currentUser, role]);

  const programmeIds = useMemo(
    () =>
      new Set([
        ...enrollments
          .map((item) => item.programmeId)
          .filter((value): value is string => Boolean(value)),
        ...studentRecords
          .map((item) => item.programmeId)
          .filter((value): value is string => Boolean(value)),
      ]),
    [enrollments, studentRecords]
  );

  const courseUnitIds = useMemo(() => {
    const ids = new Set<string>();

    enrollments.forEach((item) => {
      item.courseUnitIds?.forEach((id) => ids.add(id));
      if (item.courseId) ids.add(item.courseId);
    });
    studentRecords.forEach((student) => student.assignedCourseUnitIds?.forEach((id) => ids.add(id)));

    return ids;
  }, [enrollments, studentRecords]);

  const accessibleModuleIds = useMemo(
    () =>
      new Set(
        modules
          .filter((module) => Boolean(module.courseUnitId) && courseUnitIds.has(module.courseUnitId!))
          .map((module) => module.id)
      ),
    [courseUnitIds, modules]
  );

  const hasInstitutionalEnrollment = useMemo(
    () =>
      enrollments.some(
        (item) => Boolean(item.programmeId) || Boolean(item.courseUnitIds?.length)
      ),
    [enrollments]
  );

  const hasElevatedAccess = role === "tutor" || role === "admin";

  const canAccessCourseUnit = useCallback(
    (courseUnitId?: string, programmeId?: string) => {
      if (hasElevatedAccess) return true;
      if (!courseUnitId && !programmeId) return false;

      return (
        (courseUnitId ? courseUnitIds.has(courseUnitId) : false) ||
        (programmeId ? programmeIds.has(programmeId) : false)
      );
    },
    [courseUnitIds, hasElevatedAccess, programmeIds]
  );

  const canAccessQuiz = useCallback(
    (quiz: Quiz) => {
      if (hasElevatedAccess) return true;

      if (quiz.courseUnitId && courseUnitIds.has(quiz.courseUnitId)) {
        return true;
      }

      if (quiz.programmeId && programmeIds.has(quiz.programmeId)) {
        return true;
      }

      if (quiz.moduleId && accessibleModuleIds.has(quiz.moduleId)) {
        return true;
      }

      const hasAcademicLink = Boolean(
        quiz.programmeId || quiz.courseUnitId || quiz.moduleId
      );

      return !hasAcademicLink && !hasInstitutionalEnrollment;
    },
    [
      accessibleModuleIds,
      courseUnitIds,
      hasElevatedAccess,
      hasInstitutionalEnrollment,
      programmeIds,
    ]
  );

  return {
    enrollments,
    programmeIds,
    courseUnitIds,
    loading,
    error,
    hasElevatedAccess,
    canAccessCourseUnit,
    canAccessQuiz,
  };
}
