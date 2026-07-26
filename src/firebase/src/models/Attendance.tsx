export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  studentId: string;
  studentAuthUid?: string;
  studentEmail?: string;
  studentName: string;
  registrationNumber: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSession {
  id: string;
  courseUnitId: string;
  courseUnitTitle: string;
  courseUnitCode?: string;
  programmeId?: string;
  programmeTitle?: string;
  sessionDate: string;
  lessonTitle: string;
  classGroup?: string;
  academicYear?: string;
  semester?: string;
  records: AttendanceRecord[];
  studentIds?: string[];
  studentAuthUids?: string[];
  studentEmails?: string[];
  markedByUid: string;
  markedByName: string;
  createdAt?: Date;
  updatedAt?: Date;
}
