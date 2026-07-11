export type ProgrammeLevel =
  | "Certificate"
  | "Diploma"
  | "Higher Diploma"
  | "Degree"
  | "Postgraduate Diploma"
  | "Master's"
  | "PhD"
  | "CPD";

export interface CourseUnit {
  // Firestore Document ID
  id: string;

  // Parent Programme
  programmeId: string;
  programmeTitle: string;

  // Course Unit Details
  slug: string;
  title: string;
  category: string;
  description: string;

  // Academic Information
  level: ProgrammeLevel;
  code?: string;          // e.g. PAT1101
  semester?: number;      // Semester 1, 2...
  yearOfStudy?: number;   // Year 1, 2, 3...
  creditUnits?: number;   // e.g. 3 or 4 Credit Units

  // Media
  image: string;

  // Teaching
  tutor: string;
  duration: string;

  // Curriculum Statistics
  modules: number;
  lessons: number;

  // Learner Statistics
  rating: number;
  students: string;

  // Settings
  certificate: boolean;
  isFeatured: boolean;
  isNew?: boolean;
  published: boolean;

  // Audit Fields
  createdAt?: Date;
  updatedAt?: Date;
}