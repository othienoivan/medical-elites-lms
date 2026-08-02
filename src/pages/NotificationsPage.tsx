import { useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  Award,
  Bell,
  CalendarCheck,
  CheckCheck,
  ClipboardCheck,
  CreditCard,
  GraduationCap,
  Info,
  Megaphone,
  MessageCircle,
  Pin,
  Search,
  Settings,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import useNotifications from "../hooks/useNotifications";
import type {
  AppNotification,
  NotificationPreferences,
  NotificationPriority,
  NotificationType,
} from "../models/Notification";

const TYPE_LABELS: Record<NotificationType, string> = {
  message: "Messages",
  announcement: "Announcements",
  assessment: "Assessments",
  attendance: "Attendance",
  result: "Results",
  clinical: "Clinical",
  finance: "Finance",
  academic: "Academic",
  system: "System",
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    preferences,
    unreadCount,
    loading,
    error,
    markRead,
    markAllRead,
    togglePinned,
    toggleArchived,
    updatePreferences,
  } = useNotifications();
  const [queryText, setQueryText] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | NotificationType>("all");
  const [view, setView] = useState<"active" | "archived">("active");
  const [showPreferences, setShowPreferences] = useState(false);

  const visible = useMemo(() => notifications.filter((item) => {
    if ((view === "archived") !== item.isArchived) return false;
    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    const search = queryText.trim().toLowerCase();
    return !search || `${item.title} ${item.body}`.toLowerCase().includes(search);
  }), [notifications, queryText, typeFilter, view]);

  async function openNotification(notification: AppNotification) {
    if (!notification.isRead) await markRead(notification.id);
    if (notification.link) navigate(notification.link);
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-7 text-white">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">Notification Centre</h1>
              <p className="mt-2 text-blue-100">{unreadCount} unread notification{unreadCount === 1 ? "" : "s"}.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => void markAllRead()} disabled={unreadCount === 0}>
                <CheckCheck size={18} /> Mark all read
              </Button>
              <Button className="bg-blue-900 text-white hover:bg-blue-950" onClick={() => setShowPreferences((value) => !value)}>
                <Settings size={18} /> Preferences
              </Button>
            </div>
          </div>
        </section>

        {showPreferences && preferences && (
          <PreferencesPanel preferences={preferences} onSave={updatePreferences} />
        )}

        {error && <Card className="mt-6 border border-red-200 text-red-700">{error}</Card>}

        <section className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <Search size={18} className="text-slate-400" />
            <input value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder="Search notifications" className="w-full outline-none" />
          </label>
          <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as "all" | NotificationType)} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <option value="all">All categories</option>
            {Object.entries(TYPE_LABELS).map(([type, label]) => <option key={type} value={type}>{label}</option>)}
          </select>
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <button className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === "active" ? "bg-blue-700 text-white" : "text-slate-600"}`} onClick={() => setView("active")}>Active</button>
            <button className={`rounded-lg px-4 py-2 text-sm font-semibold ${view === "archived" ? "bg-blue-700 text-white" : "text-slate-600"}`} onClick={() => setView("archived")}>Archived</button>
          </div>
        </section>

        <div className="mt-6 space-y-4">
          {loading ? <Card>Loading notifications...</Card> : visible.length === 0 ? (
            <Card className="text-center">
              <Bell className="mx-auto text-slate-400" size={48} />
              <h2 className="mt-4 text-xl font-bold text-slate-950">No {view} notifications</h2>
              <p className="mt-2 text-slate-600">Academic, clinical, financial and communication updates will appear here.</p>
            </Card>
          ) : visible.map((notification) => (
            <article key={notification.id} className={`rounded-2xl border p-5 transition hover:shadow-md ${notification.isRead ? "border-slate-200 bg-white" : "border-blue-200 bg-blue-50"}`}>
              <div className="flex items-start gap-4">
                <button type="button" onClick={() => void openNotification(notification)} className="rounded-xl bg-white p-3 text-blue-700 shadow-sm" aria-label={`Open ${notification.title}`}>
                  <NotificationIcon type={notification.type} />
                </button>
                <button type="button" onClick={() => void openNotification(notification)} className="min-w-0 flex-1 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-slate-950">{notification.title}</h3>
                    <PriorityBadge priority={notification.priority} />
                    {notification.isPinned && <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-800">Pinned</span>}
                    <span className="ml-auto text-xs text-slate-500">{formatDate(notification.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{notification.body}</p>
                  {!notification.isRead && <span className="mt-3 inline-block rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white">New</span>}
                </button>
                <div className="flex gap-1">
                  <button type="button" onClick={() => void togglePinned(notification)} className="rounded-lg p-2 text-slate-500 hover:bg-amber-50 hover:text-amber-700" aria-label={notification.isPinned ? "Unpin" : "Pin"}><Pin size={18} /></button>
                  <button type="button" onClick={() => void toggleArchived(notification)} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label={notification.isArchived ? "Restore" : "Archive"}>{notification.isArchived ? <ArchiveRestore size={18} /> : <Archive size={18} />}</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

function PreferencesPanel({ preferences, onSave }: { preferences: NotificationPreferences; onSave: (next: NotificationPreferences) => Promise<void> }) {
  const [draft, setDraft] = useState(preferences);
  const [saving, setSaving] = useState(false);

  function toggle(type: NotificationType, channel: "email" | "push" | "sms") {
    setDraft((current) => ({ ...current, categories: { ...current.categories, [type]: { ...current.categories[type], [channel]: !current.categories[type][channel] } } }));
  }

  return (
    <Card className="mt-6">
      <h2 className="text-xl font-bold text-slate-950">Delivery preferences</h2>
      <p className="mt-1 text-sm text-slate-600">In-app delivery remains enabled for institutional notices. External channels become active when their providers are configured.</p>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-left text-slate-500"><th className="py-3">Category</th><th>In-app</th><th>Email</th><th>Push</th><th>SMS</th></tr></thead>
          <tbody>{Object.entries(TYPE_LABELS).map(([rawType, label]) => {
            const type = rawType as NotificationType;
            const value = draft.categories[type];
            return <tr key={type} className="border-b border-slate-100"><td className="py-3 font-semibold">{label}</td><td>Always</td>{(["email", "push", "sms"] as const).map((channel) => <td key={channel}><input type="checkbox" checked={value[channel]} onChange={() => toggle(type, channel)} /></td>)}</tr>;
          })}</tbody>
        </table>
      </div>
      <Button className="mt-5" disabled={saving} onClick={() => { setSaving(true); void onSave(draft).finally(() => setSaving(false)); }}>{saving ? "Saving..." : "Save preferences"}</Button>
    </Card>
  );
}

function NotificationIcon({ type }: { type: NotificationType }) {
  const icons: Record<NotificationType, React.ElementType> = { message: MessageCircle, announcement: Megaphone, assessment: ClipboardCheck, attendance: CalendarCheck, result: Award, clinical: Stethoscope, finance: CreditCard, academic: GraduationCap, system: Info };
  const Icon = icons[type];
  return <Icon size={22} />;
}

function PriorityBadge({ priority }: { priority: NotificationPriority }) {
  if (priority === "normal") return null;
  const classes = priority === "critical" ? "bg-red-100 text-red-800" : priority === "high" ? "bg-orange-100 text-orange-800" : "bg-slate-100 text-slate-600";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${classes}`}>{priority}</span>;
}

function formatDate(value?: Date) {
  return value ? value.toLocaleString() : "Just now";
}
