export type StudentStatus =
  | "active"
  | "deferred"
  | "completed"
  | "graduated";

export interface Student {
  id: string;

  // Optional Firebase Authentication UID used to link quiz attempts and student access.
  authUid?: string;
  emailNormalized?: string;
  identityLinkedAt?: Date;

  fullName: string;
  gender: string;
  dateOfBirth: string;
  nationalId: string;

  registrationNumber: string;
  studentNumber: string;

  programmeId: string;
  programmeTitle: string;

  academicYear: string;
  intake: string;
  yearOfStudy: string;
  semester: string;

  email: string;
  phone: string;
  guardianName: string;
  guardianPhone: string;
  emergencyContact: string;

  sponsor: string;
  admissionDate: string;
  status: StudentStatus;

  createdAt?: Date;
  updatedAt?: Date;
}