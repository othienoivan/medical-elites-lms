import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../config/firebase";
import type { AppNotification, NotificationType } from "../models/Notification";

const COLLECTION = "notifications";

function toDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (value && typeof value === "object" && "toDate" in value) {
    return (value as { toDate: () => Date }).toDate();
  }
  return undefined;
}

function fromSnapshot(id: string, data: Record<string, unknown>): AppNotification {
  return {
    ...(data as unknown as AppNotification),
    id,
    createdAt: toDate(data.createdAt),
    readAt: toDate(data.readAt) ?? null,
  };
}

export async function createNotification(input: {
  userUid: string;
  title: string;
  body: string;
  type: NotificationType;
  link?: string;
}): Promise<string> {
  const reference = await addDoc(collection(db, COLLECTION), {
    userUid: input.userUid,
    title: input.title,
    body: input.body,
    type: input.type,
    link: input.link || "",
    isRead: false,
    createdAt: serverTimestamp(),
    readAt: null,
  });

  return reference.id;
}

export async function getNotificationsForUser(
  userUid: string
): Promise<AppNotification[]> {
  const snapshot = await getDocs(
    query(collection(db, COLLECTION), where("userUid", "==", userUid))
  );

  return snapshot.docs
    .map((item) => fromSnapshot(item.id, item.data()))
    .sort(
      (a, b) =>
        (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    );
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, notificationId), {
    isRead: true,
    readAt: serverTimestamp(),
  });
}

export async function markAllNotificationsRead(
  notifications: AppNotification[]
): Promise<void> {
  await Promise.all(
    notifications
      .filter((notification) => !notification.isRead)
      .map((notification) => markNotificationRead(notification.id))
  );
}
