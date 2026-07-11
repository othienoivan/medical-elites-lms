<<<<<<< HEAD
export interface QuizAnswer {
  questionId: string;

  selectedOptionId?: string;
  textAnswer?: string;

  isCorrect?: boolean;
  marksAwarded: number;
}

export interface ManualMark {
  questionId: string;

  marksAwarded: number;
  feedback: string;

  markedBy?: string;
  markedAt?: Date;
}

export interface QuizAttempt {
  id: string;

  programmeId?: string;
  programmeTitle?: string;

  courseUnitId?: string;
  courseUnitTitle?: string;

  moduleId?: string;
  moduleTitle?: string;

  quizId: string;
  quizTitle: string;

  studentId: string;
  studentName: string;

  startedAt: Date;
  submittedAt?: Date;

  durationSeconds: number;

  answers: QuizAnswer[];

  score: number;
  totalMarks: number;
  percentage: number;

  manualMarks?: ManualMark[];
  manualScore?: number;

  finalScore?: number;
  finalPercentage?: number;

  passed: boolean;
  completed: boolean;

  released?: boolean;
  releasedAt?: Date | null;

  tutorRemarks?: string;

  createdAt?: Date;
  updatedAt?: Date;
=======
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
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
}