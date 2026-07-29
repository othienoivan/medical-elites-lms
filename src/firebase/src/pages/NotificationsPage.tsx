import {
  Bell,
  CheckCheck,
  MessageCircle,
  Megaphone,
  ClipboardCheck,
  CalendarCheck,
  Award,
  Info,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useNotifications from "../hooks/useNotifications";
import type { AppNotification, NotificationType } from "../models/Notification";

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
  } = useNotifications();

  async function openNotification(notification: AppNotification) {
    if (!notification.isRead) await markRead(notification.id);
    if (notification.link) navigate(notification.link);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Notification Centre</h1>
              <p className="mt-2 text-blue-100">
                {unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.
              </p>
            </div>
            <Button
              className="bg-white text-blue-700 hover:bg-blue-50"
              onClick={() => void markAllRead()}
              disabled={unreadCount === 0}
            >
              <CheckCheck size={18} /> Mark all as read
            </Button>
          </div>
        </section>

        {error && (
          <Card className="mt-6 border border-red-200 text-red-700">{error}</Card>
        )}

        <div className="mt-8 space-y-4">
          {loading ? (
            <Card>Loading notifications...</Card>
          ) : notifications.length === 0 ? (
            <Card className="text-center">
              <Bell className="mx-auto text-slate-400" size={48} />
              <h2 className="mt-4 text-xl font-bold text-slate-950">
                No notifications yet
              </h2>
              <p className="mt-2 text-slate-600">
                Messages, results, attendance updates and announcements will appear here.
              </p>
            </Card>
          ) : (
            notifications.map((notification) => (
              <button
                key={notification.id}
                type="button"
                onClick={() => void openNotification(notification)}
                className={`w-full rounded-2xl border p-5 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
                  notification.isRead
                    ? "border-slate-200 bg-white"
                    : "border-blue-200 bg-blue-50"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-white p-3 text-blue-700 shadow-sm">
                    <NotificationIcon type={notification.type} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-bold text-slate-950">{notification.title}</h3>
                      <span className="text-xs text-slate-500">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {notification.body}
                    </p>
                    {!notification.isRead && (
                      <span className="mt-3 inline-block rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white">
                        New
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const icons: Record<NotificationType, React.ElementType> = {
    message: MessageCircle,
    announcement: Megaphone,
    assessment: ClipboardCheck,
    attendance: CalendarCheck,
    result: Award,
    clinical: Stethoscope,
    system: Info,
  };
  const Icon = icons[type];
  return <Icon size={22} />;
}

function formatDate(value?: Date) {
  if (!value) return "Just now";
  return value.toLocaleString();
}
