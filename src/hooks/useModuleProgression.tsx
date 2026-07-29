import { useEffect, useMemo, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import useAuth from "./useAuth";
import useQuizzes from "./useQuizzes";
import type { Module } from "../models/Module";

export default function useModuleProgression(modules: Module[]) {
  const { currentUser, role } = useAuth();
  const { quizzes } = useQuizzes();
  const [passedQuizIds, setPassedQuizIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!currentUser || role !== "student") { setPassedQuizIds(new Set()); return; }
    let active = true;
    void getDocs(query(collection(db, "quizAttempts"), where("studentId", "==", currentUser.uid)))
      .then(snapshot => {
        if (!active) return;
        setPassedQuizIds(new Set(snapshot.docs.filter(doc => {
          const data = doc.data();
          return data.completed !== false && (data.passed === true || Number(data.finalPercentage ?? data.percentage ?? 0) >= 50);
        }).map(doc => String(doc.data().quizId || "")).filter(Boolean)));
      })
      .catch(error => console.warn("Module progression attempts could not be loaded", error));
    return () => { active = false; };
  }, [currentUser, role]);

  return useMemo(() => {
    const ordered = [...modules].sort((a,b)=>a.order-b.order);
    const unlocked = new Set<string>();
    ordered.forEach((module, index) => {
      if (index === 0 || role !== "student") { unlocked.add(module.id); return; }
      const previous = ordered[index - 1];
      if (!previous.quizRequired) { unlocked.add(module.id); return; }
      const previousQuizzes = quizzes.filter(quiz => quiz.moduleId === previous.id && quiz.status === "published");
      if (previousQuizzes.some(quiz => passedQuizIds.has(quiz.id))) unlocked.add(module.id);
    });
    return { isUnlocked: (moduleId: string) => unlocked.has(moduleId) };
  }, [modules, passedQuizIds, quizzes, role]);
}
