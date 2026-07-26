import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getNotificationPreferences,
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotificationPreferences,
  setNotificationArchived,
  setNotificationPinned,
} from "../firebase/notifications";
import useAuth from "./useAuth";
import type { AppNotification, NotificationPreferences } from "../models/Notification";

export default function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setPreferences(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const [items, userPreferences] = await Promise.all([
        getNotificationsForUser(currentUser.uid),
        getNotificationPreferences(currentUser.uid),
      ]);
      setNotifications(items);
      setPreferences(userPreferences);
    } catch (caughtError) {
      console.error("Failed to load notifications:", caughtError);
      setError(caughtError instanceof Error ? caughtError.message : "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead && !notification.isArchived).length,
    [notifications]
  );

  async function markRead(notificationId: string) {
    await markNotificationRead(notificationId);
    setNotifications((current) => current.map((item) =>
      item.id === notificationId ? { ...item, isRead: true, readAt: new Date() } : item
    ));
  }

  async function markAllRead() {
    await markAllNotificationsRead(notifications.filter((item) => !item.isArchived));
    setNotifications((current) => current.map((item) => item.isArchived ? item : { ...item, isRead: true }));
  }

  async function togglePinned(notification: AppNotification) {
    await setNotificationPinned(notification.id, !notification.isPinned);
    setNotifications((current) => current.map((item) =>
      item.id === notification.id ? { ...item, isPinned: !item.isPinned } : item
    ));
  }

  async function toggleArchived(notification: AppNotification) {
    await setNotificationArchived(notification.id, !notification.isArchived);
    setNotifications((current) => current.map((item) =>
      item.id === notification.id ? { ...item, isArchived: !item.isArchived } : item
    ));
  }

  async function updatePreferences(next: NotificationPreferences) {
    await saveNotificationPreferences(next);
    setPreferences(next);
  }

  return {
    notifications,
    preferences,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markRead,
    markAllRead,
    togglePinned,
    toggleArchived,
    updatePreferences,
  };
}
