export type ClinicalEntryStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "returned"
  | "rejected";

export type PatientSex = "female" | "male" | "other" | "not-recorded";
export type ClinicalEncounterType = "case" | "procedure" | "ward-round" | "community" | "simulation";
export type ParticipationLevel = "observed" | "assisted" | "performed-supervised" | "performed-independently";
export type CompetencyLevel = "not-assessed" | "needs-improvement" | "developing" | "competent" | "proficient";

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
  rotationName?: string;
  supervisorName: string;
  supervisorRole?: string;
  encounterType: ClinicalEncounterType;
  participationLevel: ParticipationLevel;
  clinicalHours: number;
  procedureCategory: string;
  procedureName: string;
  procedureDate: string;
  patientAgeGroup: string;
  patientSex: PatientSex;
  indication: string;
  outcome: string;
  learningOutcomes: string[];
  reflection: string;
  evidenceLinks: string[];
  status: ClinicalEntryStatus;
  tutorComment?: string;
  competencyLevel?: CompetencyLevel;
  communicationScore?: number;
  clinicalReasoningScore?: number;
  professionalismScore?: number;
  proceduralSkillScore?: number;
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
