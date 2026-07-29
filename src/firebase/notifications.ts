import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";
import type {
  AppNotification,
  NotificationChannelPreference,
  NotificationPreferences,
  NotificationPriority,
  NotificationType,
} from "../models/Notification";
import { DEFAULT_NOTIFICATION_CHANNELS } from "../models/Notification";

const COLLECTION = "notifications";
const PREFERENCES_COLLECTION = "notificationPreferences";
const TYPES: NotificationType[] = [
  "message", "announcement", "assessment", "attendance", "result",
  "clinical", "finance", "academic", "system",
];

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}

function normaliseType(value: unknown): NotificationType {
  return TYPES.includes(value as NotificationType) ? value as NotificationType : "system";
}

function normalisePriority(value: unknown): NotificationPriority {
  return value === "low" || value === "high" || value === "critical" ? value : "normal";
}

function fromSnapshot(id: string, data: Record<string, unknown>): AppNotification {
  return {
    id,
    userUid: String(data.userUid || ""),
    title: String(data.title || "Notification"),
    body: String(data.body || ""),
    type: normaliseType(data.type),
    priority: normalisePriority(data.priority),
    link: typeof data.link === "string" ? data.link : "",
    isRead: data.isRead === true,
    isPinned: data.isPinned === true,
    isArchived: data.isArchived === true,
    eventKey: typeof data.eventKey === "string" ? data.eventKey : undefined,
    createdAt: toDate(data.createdAt),
    readAt: toDate(data.readAt) ?? null,
    archivedAt: toDate(data.archivedAt) ?? null,
  };
}

function defaultCategories(): Record<NotificationType, NotificationChannelPreference> {
  return Object.fromEntries(
    TYPES.map((type) => [type, { ...DEFAULT_NOTIFICATION_CHANNELS }])
  ) as Record<NotificationType, NotificationChannelPreference>;
}

export async function createNotification(input: {
  userUid: string;
  title: string;
  body: string;
  type: NotificationType;
  priority?: NotificationPriority;
  link?: string;
  eventKey?: string;
}): Promise<string> {
  const actorUid = auth.currentUser?.uid;
  if (!actorUid) throw new Error("Sign in before creating a notification.");

  const reference = await addDoc(collection(db, COLLECTION), {
    createdByUid: actorUid,
    userUid: input.userUid,
    title: input.title.trim().slice(0, 160),
    body: input.body.trim().slice(0, 2000),
    type: input.type,
    priority: input.priority || "normal",
    link: input.link || "",
    eventKey: input.eventKey || "",
    isRead: false,
    isPinned: false,
    isArchived: false,
    createdAt: serverTimestamp(),
    readAt: null,
    archivedAt: null,
  });

  return reference.id;
}

export async function getNotificationsForUser(userUid: string): Promise<AppNotification[]> {
  const snapshot = await getDocs(query(collection(db, COLLECTION), where("userUid", "==", userUid)));
  return snapshot.docs
    .map((item) => fromSnapshot(item.id, item.data()))
    .sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      return (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0);
    });
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, notificationId), { isRead: true, readAt: serverTimestamp() });
}

export async function setNotificationPinned(notificationId: string, isPinned: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, notificationId), { isPinned });
}

export async function setNotificationArchived(notificationId: string, isArchived: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, notificationId), {
    isArchived,
    archivedAt: isArchived ? serverTimestamp() : null,
  });
}

export async function markAllNotificationsRead(notifications: AppNotification[]): Promise<void> {
  const unread = notifications.filter((item) => !item.isRead);
  if (!unread.length) return;
  const batch = writeBatch(db);
  unread.forEach((item) => batch.update(doc(db, COLLECTION, item.id), {
    isRead: true,
    readAt: serverTimestamp(),
  }));
  await batch.commit();
}

export async function getNotificationPreferences(userUid: string): Promise<NotificationPreferences> {
  const snapshot = await getDoc(doc(db, PREFERENCES_COLLECTION, userUid));
  const categories = defaultCategories();
  if (snapshot.exists()) {
    const stored = snapshot.data().categories as Partial<Record<NotificationType, Partial<NotificationChannelPreference>>> | undefined;
    TYPES.forEach((type) => {
      categories[type] = { ...categories[type], ...(stored?.[type] || {}) };
      // In-app system and critical institutional delivery remains available.
      categories[type].inApp = true;
    });
  }
  return { userUid, categories, updatedAt: toDate(snapshot.data()?.updatedAt) };
}

export async function saveNotificationPreferences(preferences: NotificationPreferences): Promise<void> {
  const userUid = auth.currentUser?.uid;
  if (!userUid || userUid !== preferences.userUid) throw new Error("You can only update your own preferences.");
  const categories = Object.fromEntries(TYPES.map((type) => [
    type,
    { ...preferences.categories[type], inApp: true },
  ]));
  await setDoc(doc(db, PREFERENCES_COLLECTION, userUid), {
    userUid,
    categories,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
