export interface Course {
  id: string;
  slug: string;
  title: string;
  code?: string;
  category: string;
  description: string;
  image: string;
  tutor: string;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  modulesCount: number;
  lessonsCount: number;
  rating: number;
  students: string;
  certificate: boolean;
  isFeatured: boolean;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}