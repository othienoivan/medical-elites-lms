export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  passMark: number;
  isLockedByDefault: boolean;
  isPublished: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}