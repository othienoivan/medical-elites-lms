export interface Module {
  id: string;
  programmeId?: string;
  programmeTitle?: string;
  courseUnitId?: string;
  courseUnitTitle?: string;
  /** Legacy course-unit identifier retained during migration. */
  courseId?: string;
  title: string;
  description: string;
  order: number;
  code?: string;
  estimatedHours?: number;
  passMark: number;
  duration: string;
  lessons: number;
  published: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
