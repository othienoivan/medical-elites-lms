import type { Timestamp } from "firebase/firestore";

export type RecordStatus = "active" | "inactive" | "archived";

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: RecordStatus;
  createdAt?: Date | Timestamp | null;
  updatedAt?: Date | Timestamp | null;
}

export interface Semester {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
  status: RecordStatus;
  createdAt?: Date | Timestamp | null;
  updatedAt?: Date | Timestamp | null;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  status: Exclude<RecordStatus, "inactive">;
  createdAt?: Date | Timestamp | null;
  updatedAt?: Date | Timestamp | null;
}

export interface InstitutionSettings {
  id: "primary";
  institutionName: string;
  motto: string;
  email: string;
  phone: string;
  address: string;
  website: string;
  currency: string;
  timeZone: string;
  academicYearId: string;
  semesterId: string;
  updatedAt?: Date | Timestamp | null;
}
