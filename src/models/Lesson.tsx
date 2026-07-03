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

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  order: number;
  estimatedMinutes: number;
  slides: LessonSlide[];
  videos: LessonVideo[];
  notesUrl?: string;
  quizId?: string;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}