import type { LessonBlock } from "./LessonBlock";

export interface LessonObjective {
<<<<<<< HEAD
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
=======
  id: string;
  objective: string;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
}

export interface LessonResource {
  id: string;
  title: string;
<<<<<<< HEAD
  type: "pdf" | "ppt" | "video" | "youtube" | "image" | "audio" | "link";
=======
  type:
    | "pdf"
    | "ppt"
    | "video"
    | "youtube"
    | "image"
    | "audio"
    | "link";

>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
  url: string;
}

export interface Lesson {
<<<<<<< HEAD
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
  learningObjectives?: LessonObjective[];
  sections?: LessonSection[];
  resources?: LessonResource[];
  blocks?: LessonBlock[];
  quizId?: string;
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
  updatedAt?: Date;
}
=======
  // Firestore ID
  id: string;

  // Parent Relationships
  programmeId: string;
  programmeTitle: string;

  courseUnitId: string;
  courseUnitTitle: string;

  moduleId: string;
  moduleTitle: string;

  // Lesson Information
  title: string;
  description: string;

  order: number;

  estimatedMinutes: number;

  /**
   * Legacy fields
   * Keep these temporarily for backward compatibility.
   * They will be removed after all lessons use the new block system.
   */
  learningObjectives?: LessonObjective[];
  sections?: LessonSection[];
  resources?: LessonResource[];

  /**
   * New Lesson Builder architecture
   */
  blocks: LessonBlock[];

  // Assessment
  quizId?: string;

  // Notes
  notesUrl?: string;

  // Status
  isPublished: boolean;

  // Audit
  createdAt?: Date;
  updatedAt?: Date;
}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
