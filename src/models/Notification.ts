export type NotificationType =
  | "message"
  | "announcement"
  | "assessment"
  | "attendance"
  | "result"
  | "clinical"
  | "system";

export interface AppNotification {
  id: string;
  userUid: string;
  title: string;
  body: string;
  type: NotificationType;
  link?: string;
  isRead: boolean;
  createdAt?: Date;
  readAt?: Date | null;
}
