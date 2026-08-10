import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type QueryConstraint,
} from "firebase/firestore";

import { db } from "../config/firebase";
import { refreshMarketplaceLearningAccess } from "../domains/finance/infrastructure/commerceRepository";
import useAuth from "./useAuth";
import useModules from "./useModules";
import type { Enrollment } from "../models/Enrollment";
import type { Quiz } from "../models/Quiz";
import type { Student } from "../models/Student";

const ENROLLMENTS_COLLECTION = "enrollments";
const LINK_ENROLLMENTS_COLLECTION = "registrationLinkEnrollments";

function mapEnrollment(id: string, data: Record<string, unknown>): Enrollment {
  return { ...(data as unknown as Enrollment), id };
}

async function runEnrollmentQuery(
  collectionName: string,
  constraint: QueryConstraint
): Promise<Enrollment[]> {
  const snapshot = await getDocs(
    query(collection(db, collectionName), constraint)
  );

  return snapshot.docs.map((item) => mapEnrollment(item.id, item.data()));
}

function isActiveEnrollment(item: Enrollment): boolean {
  return item.status === "active" || item.approvalStatus === "approved";
}

export default function useStudentLearningAccess() {
  const { currentUser, role, userProfile } = useAuth();
  const { modules } = useModules();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [studentRecord, setStudentRecord] = useState<Student | null>(null);
  const [marketplaceCourseUnitIds, setMarketplaceCourseUnitIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadAccess() {
      if (!currentUser || role === "tutor" || role === "admin") {
        if (active) {
          setEnrollments([]);
          setStudentRecord(null);
          setMarketplaceCourseUnitIds([]);
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const marketplaceAccess = await refreshMarketplaceLearningAccess().catch((error) => {
          console.warn("Marketplace learning access could not be refreshed:", error);
          return { courseUnitIds: [] as string[], count: 0 };
        });
        const canonicalStudent = await getDoc(doc(db, "students", currentUser.uid));
        const enrollmentResults = await Promise.allSettled([
          runEnrollmentQuery(
            ENROLLMENTS_COLLECTION,
            where("studentAuthUid", "==", currentUser.uid)
          ),
          runEnrollmentQuery(
            ENROLLMENTS_COLLECTION,
            where("userId", "==", currentUser.uid)
          ),
          runEnrollmentQuery(
            LINK_ENROLLMENTS_COLLECTION,
            where("studentAuthUid", "==", currentUser.uid)
          ),
        ]);

        const merged = new Map<string, Enrollment>();
        enrollmentResults.forEach((result) => {
          if (result.status === "fulfilled") {
            result.value.forEach((item) => merged.set(item.id, item));
          } else {
            console.warn("An optional enrollment source could not be loaded:", result.reason);
          }
        });

        if (active) {
          setStudentRecord(
            canonicalStudent.exists()
              ? ({ ...(canonicalStudent.data() as Student), id: canonicalStudent.id })
              : null
          );
          setEnrollments(Array.from(merged.values()).filter(isActiveEnrollment));
          setMarketplaceCourseUnitIds(marketplaceAccess.courseUnitIds ?? []);
        }
      } catch (loadError) {
        console.error("Failed to load student learning access:", loadError);
        if (active) {
          setError("Your academic enrolments could not be loaded.");
          setEnrollments([]);
          setStudentRecord(null);
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
        ...(userProfile?.programmeIds || []),
        ...enrollments
          .map((item) => item.programmeId)
          .filter((value): value is string => Boolean(value)),
        ...(studentRecord?.programmeId ? [studentRecord.programmeId] : []),
      ]),
    [enrollments, studentRecord, userProfile]
  );

  const courseUnitIds = useMemo(() => {
    const ids = new Set<string>(userProfile?.assignedCourseUnitIds || []);

    enrollments.forEach((item) => {
      item.courseUnitIds?.forEach((id) => ids.add(id));
      if (item.courseId) ids.add(item.courseId);
    });
    studentRecord?.assignedCourseUnitIds?.forEach((id) => ids.add(id));
    marketplaceCourseUnitIds.forEach((id) => ids.add(id));

    return ids;
  }, [enrollments, marketplaceCourseUnitIds, studentRecord, userProfile]);

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
      ) || Boolean(studentRecord?.programmeId) || courseUnitIds.size > 0,
    [courseUnitIds, enrollments, studentRecord]
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
      if (quiz.courseUnitId && courseUnitIds.has(quiz.courseUnitId)) return true;
      if (quiz.programmeId && programmeIds.has(quiz.programmeId)) return true;
      if (quiz.moduleId && accessibleModuleIds.has(quiz.moduleId)) return true;

      const hasAcademicLink = Boolean(quiz.programmeId || quiz.courseUnitId || quiz.moduleId);
      return !hasAcademicLink && !hasInstitutionalEnrollment;
    },
    [accessibleModuleIds, courseUnitIds, hasElevatedAccess, hasInstitutionalEnrollment, programmeIds]
  );

  return {
    enrollments,
    programmeIds,
    courseUnitIds,
    marketplaceCourseUnitIds,
    loading,
    error,
    hasElevatedAccess,
    canAccessCourseUnit,
    canAccessQuiz,
  };
}
