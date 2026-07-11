import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
} from "../firebase/notifications";
import useAuth from "./useAuth";
import type { AppNotification } from "../models/Notification";

export default function useNotifications() {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    if (!currentUser) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setNotifications(await getNotificationsForUser(currentUser.uid));
    } catch (caughtError) {
      console.error("Failed to load notifications:", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to load notifications."
      );
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadNotifications]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  async function markRead(notificationId: string) {
    await markNotificationRead(notificationId);
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }

  async function markAllRead() {
    await markAllNotificationsRead(notifications);
    setNotifications((current) =>
      current.map((notification) => ({ ...notification, isRead: true }))
    );
  }

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markRead,
    markAllRead,
  };
}
