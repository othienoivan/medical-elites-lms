export type ExaminationStatus = "draft" | "published" | "archived";

export type ExaminationSectionType =
  | "mcq"
  | "true-false"
  | "short-answer"
  | "structured"
  | "essay"
  | "clinical-case"
  | "osce"
  | "ospe";

export interface ExaminationQuestionRef {
  id: string;
  questionId: string;
  order: number;
  marks: number;
}

export interface ExaminationSection {
  id: string;
  title: string;
  instructions: string;
  type: ExaminationSectionType;
  order: number;
  questions: ExaminationQuestionRef[];
  totalMarks: number;
}

export interface Examination {
  id: string;

  title: string;
  description: string;

  programmeId?: string;
  programmeTitle?: string;

  courseUnitId?: string;
  courseUnitTitle?: string;

  moduleId?: string;
  moduleTitle?: string;

  institutionName: string;
  examinationName: string;
  academicYear: string;
  semester?: string;

  timeAllowed: string;
  candidateInstructions: string;

  sections: ExaminationSection[];

  totalMarks: number;

  status: ExaminationStatus;

  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}