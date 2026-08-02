export type AnnouncementPriority = "normal" | "important" | "urgent";
export type AnnouncementAudience = "all" | "students" | "tutors";
export type AnnouncementTargetType = "all" | "programme" | "courseUnit";

export interface Announcement {
  id: string;
  tenantId?: string;
  institutionId?: string;
  title: string;
  message: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  targetType: AnnouncementTargetType;
  programmeId?: string;
  programmeTitle?: string;
  courseUnitId?: string;
  courseUnitTitle?: string;
  isPublished: boolean;
  publishedAt?: Date;
  expiresAt?: Date | null;
  createdByUid: string;
  createdByName: string;
  createdAt?: Date;
  updatedAt?: Date;
}
