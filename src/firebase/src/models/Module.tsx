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
  quizRequired?: boolean;
  quizId?: string;
  duration: string;
  lessons: number;
  published: boolean;
  ownerUserId?: string;
  createdByUid?: string;
  institutionId?: string;
  assignedTutorIds?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
