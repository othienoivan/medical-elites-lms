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

  level: "Beginner" | "Intermediate" | "Advanced";

  rating: number;

  students: string;

  certificate: boolean;

  isFeatured: boolean;

  isNew?: boolean;

  published: boolean;

  createdAt?: Date;

  updatedAt?: Date;
}