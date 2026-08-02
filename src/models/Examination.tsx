export type ExaminationStatus = "draft" | "published" | "archived";
export type ExaminationType = "cat" | "midterm" | "final" | "mock" | "supplementary" | "osce" | "practical";
export type ExaminationTemplate = "institutional" | "uaheb" | "nche" | "university";

export type ExaminationSectionType =
  | "mcq" | "true-false" | "short-answer" | "structured" | "essay"
  | "clinical-case" | "osce" | "ospe";

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

export interface ExaminationBlueprintRow {
  label: string;
  questionCount: number;
  marks: number;
  percentage: number;
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
  examinationType?: ExaminationType;
  template?: ExaminationTemplate;
  academicYear: string;
  semester?: string;
  yearOfStudy?: string;
  timeAllowed: string;
  durationMinutes?: number;
  passMark?: number;
  attemptsAllowed?: number;
  opensAt?: string;
  closesAt?: string;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  showResultsImmediately?: boolean;
  candidateInstructions: string;
  sections: ExaminationSection[];
  totalMarks: number;
  targetMarks?: number;
  versionLabel?: string;
  sourceExaminationId?: string;
  status: ExaminationStatus;
  createdBy?: string;
  createdByUid?: string;
  institutionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
