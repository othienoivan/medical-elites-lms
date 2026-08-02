import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import useAuth from "./useAuth";
import useQuizzes from "./useQuizzes";
import type { Module } from "../models/Module";
import type { ModuleLearningState } from "../components/ui/ModuleCard";

export default function useModuleProgression(modules: Module[], courseUnitId?: string) {
  const { currentUser, role } = useAuth();
  const { quizzes } = useQuizzes();
  const [passedQuizIds, setPassedQuizIds] = useState<Set<string>>(new Set());
  const [attemptedQuizIds, setAttemptedQuizIds] = useState<Set<string>>(new Set());
  const [startedModuleIds, setStartedModuleIds] = useState<Set<string>>(new Set());
  const [completedModuleIds, setCompletedModuleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser || role !== "student") {
      setPassedQuizIds(new Set());
      setAttemptedQuizIds(new Set());
      setStartedModuleIds(new Set());
      setCompletedModuleIds(new Set());
      return;
    }

    let active = true;
    const directEnrollmentId = courseUnitId
      ? `${currentUser.uid}_${courseUnitId}`
      : "";

    void Promise.allSettled([
      getDocs(query(collection(db, "quizAttempts"), where("studentId", "==", currentUser.uid))),
      getDocs(query(collection(db, "enrollments"), where("userId", "==", currentUser.uid))),
      getDocs(query(collection(db, "enrollments"), where("studentAuthUid", "==", currentUser.uid))),
      getDocs(query(collection(db, "enrollments"), where("studentId", "==", currentUser.uid))),
      directEnrollmentId ? getDoc(doc(db, "enrollments", directEnrollmentId)) : Promise.resolve(null),
    ]).then((results) => {
      if (!active) return;

      const attempts = results[0];
      if (attempts.status === "fulfilled") {
        const completed = attempts.value.docs.filter((item) => item.data().completed !== false);
        setAttemptedQuizIds(new Set(completed.map((item) => String(item.data().quizId || "")).filter(Boolean)));
        setPassedQuizIds(new Set(completed.filter((item) => {
          const data = item.data();
          if (data.passed === true) return true;
          const quizId = String(data.quizId || "");
          const quiz = quizzes.find((candidate) => candidate.id === quizId);
          const requiredPassMark = Number(quiz?.passMark ?? 50);
          return Number(data.finalPercentage ?? data.percentage ?? 0) >= requiredPassMark;
        }).map((item) => String(item.data().quizId || "")).filter(Boolean)));
      }

      const started = new Set<string>();
      const finished = new Set<string>();
      const enrollmentRecords: Array<Record<string, unknown>> = [];

      for (const result of results.slice(1, 4)) {
        if (
          result.status !== "fulfilled" ||
          result.value === null ||
          !("docs" in result.value)
        ) {
          continue;
        }

        for (const item of result.value.docs) {
          enrollmentRecords.push(item.data() as Record<string, unknown>);
        }
      }

      const directEnrollment = results[4];
      if (
        directEnrollment.status === "fulfilled" &&
        directEnrollment.value &&
        directEnrollment.value.exists()
      ) {
        enrollmentRecords.push(directEnrollment.value.data() as Record<string, unknown>);
      }

      for (const raw of enrollmentRecords) {
        const data = raw as {
          courseId?: string;
          courseUnitId?: string;
          courseUnitIds?: string[];
          assignedCourseUnitIds?: string[];
          startedModules?: string[];
          completedModules?: string[];
        };
        const belongs =
          !courseUnitId ||
          data.courseId === courseUnitId ||
          data.courseUnitId === courseUnitId ||
          data.courseUnitIds?.includes(courseUnitId) ||
          data.assignedCourseUnitIds?.includes(courseUnitId);
        if (!belongs) continue;
        data.startedModules?.forEach((id) => started.add(id));
        data.completedModules?.forEach((id) => finished.add(id));
      }
      setStartedModuleIds(started);
      setCompletedModuleIds(finished);
    }).catch((error) => console.warn("Module progression could not be loaded", error));

    return () => { active = false; };
  }, [currentUser, role, courseUnitId, quizzes]);

  return useMemo(() => {
    const ordered = [...modules].sort((a, b) => a.order - b.order);
    const unlocked = new Set<string>();
    const completed = new Set(completedModuleIds);
    const started = new Set(startedModuleIds);

    for (const module of ordered) {
      const moduleQuizzes = quizzes.filter((quiz) => quiz.moduleId === module.id && quiz.status === "published");
      if (moduleQuizzes.some((quiz) => attemptedQuizIds.has(quiz.id))) started.add(module.id);
      if (
        module.quizRequired &&
        moduleQuizzes.some((quiz) => passedQuizIds.has(quiz.id))
      ) {
        completed.add(module.id);
      }
      if (completed.has(module.id)) started.add(module.id);
    }

    ordered.forEach((module, index) => {
      if (index === 0 || role !== "student") { unlocked.add(module.id); return; }
      const previous = ordered[index - 1];
      if (!previous.quizRequired || completed.has(previous.id)) unlocked.add(module.id);
    });

    const getLearningState = (moduleId: string): ModuleLearningState => {
      if (completed.has(moduleId)) return "completed";
      if (started.has(moduleId)) return "in-progress";
      return "not-started";
    };

    return {
      isUnlocked: (moduleId: string) => unlocked.has(moduleId),
      isCompleted: (moduleId: string) => completed.has(moduleId),
      getLearningState,
    };
  }, [modules, passedQuizIds, attemptedQuizIds, quizzes, role, startedModuleIds, completedModuleIds]);
}
