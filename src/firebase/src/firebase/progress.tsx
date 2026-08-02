import { courseModules } from "../data/modules";
import { completeModuleAndUnlockNext } from "./enrollments";
import { saveQuizAttempt } from "./quiz";

export async function handleModuleQuizPassed({
  userId,
  courseId,
  moduleId,
  quizId,
  score,
  passMark,
}: {
  userId: string;
  courseId: string;
  moduleId: string;
  quizId: string;
  score: number;
  passMark: number;
}) {
  const passed = score >= passMark;

  await saveQuizAttempt({
    userId,
    courseId,
    moduleId,
    quizId,
    score,
    passMark,
  });

  if (!passed) {
    return {
      passed: false,
      nextModuleId: undefined,
      progress: undefined,
    };
  }

  const courseModuleList = courseModules
    .filter((module) => module.courseId === courseId)
    .sort((a, b) => a.order - b.order);

  const currentModuleIndex = courseModuleList.findIndex(
    (module) => module.id === moduleId
  );

  const nextModule = courseModuleList[currentModuleIndex + 1];

  const completedModuleCount = currentModuleIndex + 1;

  const progress = Math.round(
    (completedModuleCount / courseModuleList.length) * 100
  );

  await completeModuleAndUnlockNext({
    userId,
    courseId,
    moduleId,
    nextModuleId: nextModule?.id,
    progress,
  });

  return {
    passed: true,
    nextModuleId: nextModule?.id,
    progress,
  };
}