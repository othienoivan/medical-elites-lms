export type TimetableEntryStatus = "scheduled" | "cancelled" | "completed";

export interface TimetableEntry {
  id: string;
  programmeId?: string;
  programmeTitle?: string;
  courseUnitId: string;
  courseUnitTitle: string;
  courseUnitCode?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  venue: string;
  tutorUid: string;
  tutorName: string;
  academicYear?: string;
  semester?: string;
  classGroup?: string;
  notes?: string;
  status: TimetableEntryStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
