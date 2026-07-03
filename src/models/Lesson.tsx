export type LessonVideoType = "youtube" | "upload";

export interface LessonVideo {
  id: string;
  title: string;
  type: LessonVideoType;
  url: string;
  durationMinutes?: number;
  required?: boolean;
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
  notes?: string;
  clinicalPearl?: string;
  caseScenario?: string;
  knowledgeChecks?: LessonKnowledgeCheck[];
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  learningObjectives: string[];
  sections: LessonSection[];
  notesUrl?: string;
  quizId?: string;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}