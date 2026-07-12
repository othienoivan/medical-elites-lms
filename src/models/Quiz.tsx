export type QuizStatus = "draft" | "published" | "archived";

export type AssessmentType =
  | "lesson-quiz"
  | "short-quiz"
  | "cat"
  | "module-test"
  | "practice-test"
  | "mock-exam"
  | "final-exam";

export interface QuizQuestionRef {
  id: string;
  questionId: string;
  order: number;
  marks: number;
  /** Legacy embedded-question fields used by the original lesson player. */
  question?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  assessmentType: AssessmentType;
  assessmentCode?: string;
  weightPercentage?: number | null;
  programmeId?: string;
  programmeTitle?: string;
  courseUnitId?: string;
  courseUnitTitle?: string;
  moduleId?: string;
  moduleTitle?: string;
  questions: QuizQuestionRef[];
  totalMarks: number;
  passMark: number;
  timeLimitMinutes?: number;
  attemptsAllowed?: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showFeedbackImmediately: boolean;
  status: QuizStatus;
  availableFrom?: Date | null;
  availableUntil?: Date | null;
  requiresPassword?: boolean;
  accessPassword?: string;
  isArchived?: boolean;
  allowLateSubmission?: boolean;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
