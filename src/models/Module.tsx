export interface Module {
  id: string;
<<<<<<< HEAD
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
=======

  // Parent relationships
  programmeId: string;
  programmeTitle: string;
  courseUnitId: string;
  courseUnitTitle: string;

  // Module details
  title: string;
  description: string;
  order: number;

  // Academic settings
  code?: string;
  estimatedHours?: number;
  passMark: number;

  // Display / statistics
  duration: string;
  lessons: number;

  // Status
  published: boolean;

  // Audit
  createdAt?: Date;
  updatedAt?: Date;
}
>>>>>>> 8acb30b37116733fddeb6e5fc7a6f2cac276937d
