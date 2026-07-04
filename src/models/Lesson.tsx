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

  // Learning Content
  learningObjectives: LessonObjective[];

  sections: LessonSection[];

  resources: LessonResource[];

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