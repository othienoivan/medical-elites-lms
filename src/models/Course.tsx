export interface Course {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;

  image: string;

  tutor: string;

  duration: string;

  modules: number;

  lessons: number;

  level:
  | "Certificate"
  | "Diploma"
  | "Higher Diploma"
  | "Degree"
  | "Postgraduate Diploma"
  | "Master's"
  | "PhD";

  rating: number;

  students: string;

  certificate: boolean;

  isFeatured: boolean;

  isNew?: boolean;

  published: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}