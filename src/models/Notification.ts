export type NotificationType =
  | "message"
  | "announcement"
  | "assessment"
  | "attendance"
  | "result"
  | "clinical"
  | "finance"
  | "academic"
  | "system";

export type NotificationPriority = "low" | "normal" | "high" | "critical";

export interface AppNotification {
  id: string;
  userUid: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  link?: string;
  isRead: boolean;
  isPinned: boolean;
  isArchived: boolean;
  eventKey?: string;
  createdAt?: Date;
  readAt?: Date | null;
  archivedAt?: Date | null;
}

export interface NotificationChannelPreference {
  inApp: boolean;
  email: boolean;
  push: boolean;
  sms: boolean;
}

export interface NotificationPreferences {
  userUid: string;
  categories: Record<NotificationType, NotificationChannelPreference>;
  updatedAt?: Date;
}

export const DEFAULT_NOTIFICATION_CHANNELS: NotificationChannelPreference = {
  inApp: true,
  email: false,
  push: false,
  sms: false,
};
