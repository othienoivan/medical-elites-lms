export type QuestionType =
  | "mcq"
  | "true-false"
  | "short-answer"
  | "essay"
  | "emq";

export type QuestionDifficulty = "easy" | "medium" | "hard";

export type BloomLevel =
  | "remember"
  | "understand"
  | "apply"
  | "analyze"
  | "evaluate"
  | "create";

export interface QuestionOption {
  id: string;
  label: string;
  text: string;
}

export interface Question {
  id: string;

  programmeId?: string;
  programmeTitle?: string;

  courseUnitId?: string;
  courseUnitTitle?: string;

  moduleId?: string;
  moduleTitle?: string;

  topic: string;
  subtopic?: string;

  type: QuestionType;
  difficulty: QuestionDifficulty;
  bloomLevel: BloomLevel;

  questionText: string;

  options: QuestionOption[];

  correctAnswer: string;
  explanation: string;

  marks: number;

  tags: string[];

  isPublished: boolean;
  isDeleted?: boolean;
  deletedAt?: Date;
  deletedBy?: string;
  estimatedTimeMinutes?: number;
  usageCount?: number;

  createdBy?: string;
  ownerUserId?: string;
  createdByUid?: string;
  institutionId?: string;
  assignedTutorIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}