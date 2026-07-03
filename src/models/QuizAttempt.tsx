export interface QuizAttempt {
  id: string;
  userId: string;
  courseId: string;
  moduleId: string;
  quizId: string;
  score: number;
  passed: boolean;
  passMark: number;
  createdAt?: Date;
}