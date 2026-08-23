export interface QuizAnswer {
  questionId: string;

  selectedOptionId?: string;
  textAnswer?: string;

  isCorrect?: boolean;
  marksAwarded: number;
}


export interface QuizAttemptQuestionSnapshot {
  id: string;
  questionText: string;
  options?: Array<{ id?: string; label?: string; text?: string }>;
  correctAnswer?: string;
  explanation?: string;
  marks?: number;
  type?: string;
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

  lessonId?: string;
  lessonTitle?: string;

  quizId: string;
  quizTitle: string;

  studentId: string;
  studentName: string;

  /** Registration-link/class context captured at submission time. */
  registrationLinkId?: string;
  registrationLinkCode?: string;
  registrationLinkName?: string;
  studentGroupId?: string;
  assessmentGroupId?: string;
  classInstitutionId?: string;
  classInstitutionName?: string;

  startedAt: Date;
  submittedAt?: Date;

  durationSeconds: number;

  answers: QuizAnswer[];
  questionSnapshots?: QuizAttemptQuestionSnapshot[];

  score: number;
  totalMarks: number;
  percentage: number;

  manualMarks?: ManualMark[];
  manualScore?: number;

  finalScore?: number;
  finalPercentage?: number;
  passMark?: number;
  passMarkAtSubmission?: number;

  passed: boolean;
  completed: boolean;
  attemptNumber?: number;
  maximumAttempts?: number;

  released?: boolean;
  releasedAt?: Date | null;

  tutorRemarks?: string;

  aiMarked?: boolean;
  aiMarkingModel?: string;
  aiMarkingRequestId?: string;
  aiNeedsTutorReview?: boolean;
  aiMarkedAt?: Date;

  createdAt?: Date;
  updatedAt?: Date;
}