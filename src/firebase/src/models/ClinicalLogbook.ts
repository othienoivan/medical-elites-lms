export type ClinicalEntryStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "returned"
  | "rejected";

export type PatientSex = "female" | "male" | "other" | "not-recorded";

export interface ClinicalLogbookEntry {
  id: string;
  studentId: string;
  studentAuthUid: string;
  studentName: string;
  registrationNumber: string;
  programmeId: string;
  programmeTitle: string;
  courseUnitId?: string;
  courseUnitTitle?: string;
  clinicalSite: string;
  department: string;
  supervisorName: string;
  procedureCategory: string;
  procedureName: string;
  procedureDate: string;
  patientAgeGroup: string;
  patientSex: PatientSex;
  indication: string;
  outcome: string;
  reflection: string;
  status: ClinicalEntryStatus;
  tutorComment?: string;
  reviewedByUid?: string;
  reviewedByName?: string;
  reviewedAt?: Date | null;
  submittedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClinicalCompetencyTarget {
  procedureName: string;
  required: number;
}
