export interface Module {
  id: string;
  courseId: string;

  title: string;
  description: string;

  order: number;

  duration: string;

  lessons: number;

  passMark: number;

  published: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}