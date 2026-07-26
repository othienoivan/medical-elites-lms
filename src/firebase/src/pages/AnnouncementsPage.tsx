import { Bell, CalendarDays, Megaphone } from "lucide-react";
import { useMemo } from "react";

import Card from "../components/ui/Card";
import useAnnouncements from "../hooks/useAnnouncements";
import useAuth from "../hooks/useAuth";
import useStudentLearningAccess from "../hooks/useStudentLearningAccess";
import type { AnnouncementPriority } from "../models/Announcement";

const PAGE_LOADED_AT = Date.now();

export default function AnnouncementsPage() {
  const { userProfile } = useAuth();
  const { announcements, loading } = useAnnouncements();
  const { programmeIds, courseUnitIds, loading: accessLoading } = useStudentLearningAccess();

  const visible = useMemo(() => {
    const now = PAGE_LOADED_AT;
    return announcements.filter((item) => {
      if (!item.isPublished) return false;
      if (item.expiresAt && item.expiresAt.getTime() < now) return false;
      if (item.audience === "tutors" && userProfile?.role === "student") return false;
      if (item.targetType === "programme") return Boolean(item.programmeId && programmeIds.has(item.programmeId));
      if (item.targetType === "courseUnit") return Boolean(item.courseUnitId && courseUnitIds.has(item.courseUnitId));
      return true;
    });
  }, [announcements, courseUnitIds, programmeIds, userProfile?.role]);

  const busy = loading || accessLoading;

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-indigo-700 p-8 text-white">
          <Megaphone size={38} />
          <h1 className="mt-4 text-3xl font-bold">Announcements</h1>
          <p className="mt-2 text-blue-100">Institutional notices, academic reminders and course updates.</p>
        </section>

        <div className="mt-8 space-y-5">
          {busy ? (
            <Card>Loading announcements...</Card>
          ) : visible.length === 0 ? (
            <Card className="text-center">
              <Bell className="mx-auto text-slate-400" size={48} />
              <h2 className="mt-4 text-xl font-bold text-slate-950">No announcements available</h2>
              <p className="mt-2 text-slate-600">New notices will appear here when published.</p>
            </Card>
          ) : (
            visible.map((item) => (
              <Card key={item.id}>
                <div className="flex flex-wrap items-center gap-2">
                  <PriorityBadge priority={item.priority} />
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                    {item.targetType === "all" ? "Institution-wide" : item.courseUnitTitle || item.programmeTitle || "Academic group"}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-bold text-slate-950">{item.title}</h2>
                <p className="mt-3 whitespace-pre-wrap leading-7 text-slate-700">{item.message}</p>
                <div className="mt-5 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-2"><CalendarDays size={16} />{item.publishedAt ? item.publishedAt.toLocaleString() : "Recently published"}</span>
                  <span>By {item.createdByName}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

function PriorityBadge({ priority }: { priority: AnnouncementPriority }) {
  const classes: Record<AnnouncementPriority, string> = {
    normal: "bg-slate-100 text-slate-700",
    important: "bg-amber-100 text-amber-800",
    urgent: "bg-red-100 text-red-700",
  };
  return <span className={`rounded-full px-3 py-1 text-sm font-semibold capitalize ${classes[priority]}`}>{priority}</span>;
}
