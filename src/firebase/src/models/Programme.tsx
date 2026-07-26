export type ProgrammeLevel =
  | "Certificate"
  | "Diploma"
  | "Higher Diploma"
  | "Degree"
  | "Postgraduate Diploma"
  | "Master's"
  | "PhD"
  | "CPD";

export interface Programme {
  // Firestore Document ID
  id: string;

  // Programme Details
  title: string;
  slug: string;
  level: ProgrammeLevel;

  // Academic Structure
  faculty?: string;
  department?: string;
  school?: string;

  // Programme Information
  description: string;
  duration: string;
  image?: string;

  // Academic Metadata
  code?: string;              // e.g. DCM, BME, MBChB
  totalCourseUnits?: number;
  totalCredits?: number;
  yearsOfStudy?: number;

  // Ownership and tenant isolation
  createdBy: string;
  ownerUserId?: string;
  createdByUid?: string;
  institutionId?: string;
  assignedTutorIds?: string[];

  // Status
  published: boolean;

  // Audit Fields
  createdAt?: Date;
  updatedAt?: Date;
}