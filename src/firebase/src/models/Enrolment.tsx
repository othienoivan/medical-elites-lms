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
}

export interface Quiz {
  // Firestore
  id: string;

  // Basic Information
  title: string;
  description: string;

  // Assessment Classification
  assessmentType: AssessmentType;

  /**
   * Optional assessment code
   * Examples:
   * CAT 1
   * CAT 2
   * MT-01
   * MOCK-2026
   * FINAL I
   */
  assessmentCode?: string;

  /**
   * Contribution to final mark
   * Example:
   * Lesson Quiz = 5
   * CAT = 20
   * Final Exam = 50
   */
  weightPercentage?: number;

  // Programme Hierarchy
  programmeId?: string;
  programmeTitle?: string;

  courseUnitId?: string;
  courseUnitTitle?: string;

  moduleId?: string;
  moduleTitle?: string;

  // Questions
  questions: QuizQuestionRef[];

  totalMarks: number;
  passMark: number;

  // Quiz Settings
  timeLimitMinutes?: number;
  attemptsAllowed?: number;

  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showFeedbackImmediately: boolean;

  // Status
  status: QuizStatus;

  // Availability
availableFrom?: Date;
availableUntil?: Date;

// Access Control
requiresPassword?: boolean;
accessPassword?: string;

// Lifecycle
isArchived?: boolean;
allowLateSubmission?: boolean;

  // Audit
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}