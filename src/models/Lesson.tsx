import type { LessonBlock } from "./LessonBlock";

export interface LessonObjective {
  id: string;
  objective: string;
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
}

export interface LessonResource {
  id: string;
  title: string;
  type:
    | "pdf"
    | "ppt"
    | "video"
    | "youtube"
    | "image"
    | "audio"
    | "link";

  url: string;
}

export interface Lesson {
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