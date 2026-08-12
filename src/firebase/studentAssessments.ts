import { httpsCallable } from "firebase/functions";

import { functions } from "../config/firebase";
import type { Question } from "../models/Question";
import type { Quiz } from "../models/Quiz";

export interface StudentAssessmentPackage {
  quiz: Quiz;
  questions: Question[];
}

export async function getStudentAssessmentPackage(
  quizId: string
): Promise<StudentAssessmentPackage> {
  const callable = httpsCallable<
    { quizId: string },
    StudentAssessmentPackage
  >(functions, "getStudentAssessmentPackage");

  const result = await callable({ quizId });

  return {
    quiz: result.data.quiz,
    questions: Array.isArray(result.data.questions)
      ? result.data.questions
      : [],
  };
}

