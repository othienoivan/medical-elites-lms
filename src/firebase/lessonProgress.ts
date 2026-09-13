import { httpsCallable } from "firebase/functions";

import { functions } from "../config/firebase";

export type LessonModuleProgress = {
  moduleId: string;
  completedLessonIds: string[];
  unlockedLessonIds: string[];
};

export async function getLessonModuleProgress(
  moduleId: string,
): Promise<LessonModuleProgress> {
  const callable = httpsCallable<
    { moduleId: string },
    LessonModuleProgress
  >(functions, "getLessonModuleProgress");

  return (await callable({ moduleId })).data;
}

export type CompleteLessonLearningResult = {
  lessonId: string;
  completed: boolean;
  requiresQuiz: boolean;
  quizId?: string;
  passMark?: number;
};

export async function completeLessonLearning(
  lessonId: string,
): Promise<CompleteLessonLearningResult> {
  const callable = httpsCallable<
    { lessonId: string },
    CompleteLessonLearningResult
  >(functions, "completeLessonLearning");

  return (await callable({ lessonId })).data;
}