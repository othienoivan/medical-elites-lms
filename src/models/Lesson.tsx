export type LessonVideoType = "youtube" | "upload";

export type LessonResourceType =
  | "pdf"
  | "ppt"
  | "docx"
  | "image"
  | "zip"
  | "external";

export interface LessonVideo {
  id: string;
  title: string;
  type: LessonVideoType;
  url: string;
  durationMinutes?: number;
  required?: boolean;
}

export interface LessonResource {
  id: string;
  title: string;
  type: LessonResourceType;
  url: string;
}

export interface LessonSlide {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface LessonKnowledgeCheck {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface LessonSection {
  id: string;
  title: string;
  order: number;
  slides: LessonSlide[];
  videos: LessonVideo[];
  resources?: LessonResource[];
  notes?: string;
  clinicalPearl?: string;
  caseScenario?: string;
  knowledgeChecks?: LessonKnowledgeCheck[];
}

export interface LessonCompletionCriteria {
  watchVideos: boolean;
  completeKnowledgeChecks: boolean;
  passQuiz: boolean;
}

export interface Lesson {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  learningObjectives: string[];
  sections: LessonSection[];
  notesUrl?: string;
  quizId?: string;
  completionCriteria: LessonCompletionCriteria;
  published: boolean;
  version: number;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
}