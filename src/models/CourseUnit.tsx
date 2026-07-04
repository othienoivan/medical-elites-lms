export type ProgrammeLevel =
  | "Certificate"
  | "Diploma"
  | "Higher Diploma"
  | "Degree"
  | "Postgraduate Diploma"
  | "Master's"
  | "PhD";

export interface CourseUnit {
  id: string;

  // Parent Programme
  programmeId: string;
  programmeTitle: string;

  slug: string;

  title: string;

  category: string;

  description: string;

  image: string;

  tutor: string;

  duration: string;

  modules: number;

  lessons: number;

  level: ProgrammeLevel;

  rating: number;

  students: string;

  certificate: boolean;

  isFeatured: boolean;

  isNew?: boolean;

  published: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}