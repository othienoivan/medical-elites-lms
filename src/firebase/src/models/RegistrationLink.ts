import type { Timestamp } from "firebase/firestore";

export type RegistrationLinkType = "tutor" | "institution" | "programme" | "class" | "course-unit";
export type RegistrationLinkStatus = "active" | "disabled" | "revoked";

export interface RegistrationLink {
  id: string;
  code: string;
  name: string;
  linkType: RegistrationLinkType;
  status: RegistrationLinkStatus;
  createdByUid: string;
  ownerRole: "tutor" | "admin";
  institutionId?: string;
  institutionName?: string;
  tutorId?: string;
  tutorName?: string;
  programmeId?: string;
  programmeTitle?: string;
  academicYear?: string;
  yearOfStudy?: string;
  semester?: string;
  studentGroupId?: string;
  courseUnitIds: string[];
  requiresApproval: boolean;
  maximumRegistrations?: number;
  registrationCount: number;
  expiresAt?: Date | Timestamp | null;
  createdAt?: Date | Timestamp | null;
  updatedAt?: Date | Timestamp | null;
}

export interface RegistrationLinkEnrollment {
  id: string;
  registrationLinkId: string;
  registrationLinkCode: string;
  studentAuthUid: string;
  studentEmail: string;
  studentName: string;
  institutionId?: string;
  tutorId?: string;
  programmeId?: string;
  academicYear?: string;
  yearOfStudy?: string;
  semester?: string;
  studentGroupId?: string;
  courseUnitIds: string[];
  approvalStatus: "approved" | "pending" | "rejected";
  joinedAt?: Date | Timestamp | null;
  approvedAt?: Date | Timestamp | null;
  approvedByUid?: string;
}
