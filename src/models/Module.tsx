export interface Module {
  id: string;

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