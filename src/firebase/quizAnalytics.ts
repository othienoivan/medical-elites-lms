import { httpsCallable } from "firebase/functions";

import { functions } from "../config/firebase";
import type { Question } from "../models/Question";
import type { Quiz } from "../models/Quiz";
import type { QuizAttempt } from "../models/QuizAttempt";

type TutorQuizAnalyticsResponse = { quiz: Quiz | null; attempts: QuizAttempt[]; questions: Question[] };

function dateValue(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

export async function getTutorQuizAnalytics(quizId: string): Promise<TutorQuizAnalyticsResponse> {
  const callable = httpsCallable<{ quizId: string }, TutorQuizAnalyticsResponse>(functions, "getTutorQuizAnalytics");
  const result = await callable({ quizId });
  return {
    ...result.data,
    attempts: (result.data.attempts ?? []).map((attempt) => ({
      ...attempt,
      startedAt: dateValue(attempt.startedAt) ?? new Date(0),
      submittedAt: dateValue(attempt.submittedAt),
      createdAt: dateValue(attempt.createdAt),
      updatedAt: dateValue(attempt.updatedAt),
      releasedAt: dateValue(attempt.releasedAt),
    })),
  };
}
