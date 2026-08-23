import type { LessonBlock } from "./LessonBlock";

export interface LessonObjective {
  id?: string;
  objective: string;
}

export interface LessonSlide {
  id: string;
  title: string;
  order?: number;
  content: string;
}

export interface LessonVideo {
  id: string;
  title: string;
  type: "video" | "youtube" | "link";
  url: string;
  durationMinutes?: number;
  required?: boolean;
}

export interface KnowledgeCheck {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

export interface LessonSection {
  id: string;
  title: string;
  content?: string;
  order?: number;
  slides?: LessonSlide[];
  videos?: LessonVideo[];
  clinicalPearl?: string;
  caseScenario?: string;
  knowledgeChecks?: KnowledgeCheck[];
}

export interface LessonResource {
  id: string;
  title: string;
  type: "pdf" | "ppt" | "video" | "youtube" | "image" | "audio" | "link";
  url: string;
}

export interface Lesson {
  id: string;
  programmeId?: string;
  programmeTitle?: string;
  courseUnitId?: string;
  courseUnitTitle?: string;
  moduleId: string;
  moduleTitle?: string;
  /** Legacy alias used by original seed data. */
  courseId?: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
  prerequisites?: string[];
  references?: string[];
  learningObjectives?: LessonObjective[];
  sections?: LessonSection[];
  resources?: LessonResource[];
  blocks?: LessonBlock[];
  quizId?: string;
  quizRequired?: boolean;
  quizPassMark?: number;
  notesUrl?: string;
  isPublished?: boolean;
  /** Legacy alias used by original seed data. */
  published?: boolean;
  version?: number;
  createdBy?: string;
  completionCriteria?: {
    watchVideos?: boolean;
    completeKnowledgeChecks?: boolean;
    passQuiz?: boolean;
  };
  createdAt?: Date;
  ownerUserId?: string;
  createdByUid?: string;
  institutionId?: string | null;
  assignedTutorIds?: string[];
  updatedAt?: Date;
}
