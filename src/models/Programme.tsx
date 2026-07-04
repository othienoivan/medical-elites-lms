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
  id: string;
  title: string;
  slug: string;
  level: ProgrammeLevel;
  faculty?: string;
  department?: string;
  description: string;
  duration: string;
  image?: string;
  createdBy: string;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}