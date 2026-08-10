import {
   Bell,
  BookOpen,
  CalendarCheck,
    ClipboardCheck,
  FileText,
  GraduationCap,
  HelpCircle,
    LibraryBig,
  Megaphone,
   PlusCircle,
  Sparkles,
  Stethoscope,
  Users,
  WalletCards,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import ActivityFeed from "../components/dashboard/ActivityFeed";
import DailyBrief from "../components/dashboard/DailyBrief";
import DashboardWidget from "../components/dashboard/DashboardWidget";
import MediInsight from "../components/dashboard/MediInsight";
import MyDay from "../components/dashboard/MyDay";
import QuickActions from "../components/dashboard/QuickActions";
import StatWidget from "../components/dashboard/StatWidget";
import WidgetGrid from "../components/dashboard/WidgetGrid";
import TutorLayout from "../components/layout/TutorLayout";
import Button from "../components/ui/Button";
import useAttendance from "../hooks/useAttendance";
import useAuth from "../hooks/useAuth";
import { useTutorClinicalLogbook } from "../hooks/useClinicalLogbook";
import useMessages from "../hooks/useMessages";
import useNotifications from "../hooks/useNotifications";
import useTimetable from "../hooks/useTimetable";
import useTutorQuizAttempts from "../hooks/useTutorQuizAttempts";

function currentDayName() {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
}

export default function TutorDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { attempts, loading: attemptsLoading } = useTutorQuizAttempts();
  const { entries: clinicalEntries, loading: clinicalLoading } = useTutorClinicalLogbook();
  const { sessions, loading: attendanceLoading } = useAttendance();
  const { entries: timetableEntries, loading: timetableLoading } = useTimetable();
  const { conversations, loading: messagesLoading } = useMessages();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotifications();

  const pendingMarking = attempts.filter((attempt) => !attempt.released).length;
  const pendingClinical = clinicalEntries.filter((entry) => entry.status === "submitted").length;

  const todaySchedule = useMemo(() => {
    const day = currentDayName().toLowerCase();
    return timetableEntries
      .filter(
        (entry) =>
          entry.status === "scheduled" &&
          entry.dayOfWeek.toLowerCase() === day &&
          (!entry.tutorUid || entry.tutorUid === currentUser?.uid)
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 6)
      .map((entry) => ({
        id: entry.id,
        time: entry.startTime,
        title: entry.courseUnitTitle,
        meta: `${entry.venue || "Venue TBC"}${entry.classGroup ? ` · ${entry.classGroup}` : ""}`,
      }));
  }, [currentUser?.uid, timetableEntries]);

  const recentActivity = useMemo(() => {
    const reviewItems = clinicalEntries.filter((entry) => entry.status === "submitted").map((entry) => ({ id: `clinical-${entry.id}`, title: `${entry.studentName} submitted a clinical entry`, detail: entry.procedureName, at: new Date((entry as typeof entry & { updatedAt?: Date; createdAt?: Date }).updatedAt ?? (entry as typeof entry & { createdAt?: Date }).createdAt ?? 0).getTime() }));
    const submissionItems = attempts.map((attempt) => ({ id: `attempt-${attempt.id}`, title: `${attempt.studentName || "Student"} submitted an assessment`, detail: attempt.quizTitle || "Assessment submission", at: new Date(attempt.submittedAt ?? attempt.updatedAt ?? attempt.createdAt ?? 0).getTime() }));
    return [...reviewItems, ...submissionItems].sort((a, b) => b.at - a.at).slice(0, 6).map(({ id, title, detail }) => ({ id, title, detail }));
  }, [attempts, clinicalEntries]);

  const loading =
    attemptsLoading ||
    clinicalLoading ||
    attendanceLoading ||
    timetableLoading ||
    messagesLoading ||
    notificationsLoading;

  const displayName = userProfile?.fullName || currentUser?.email?.split("@")[0] || "Tutor";
  const today = new Date().toISOString().slice(0, 10);
  const attendanceToday = sessions.filter(
    (session) => session.sessionDate === today && session.markedByUid === currentUser?.uid
  ).length;

  return (
    <TutorLayout title="Tutor Dashboard" subtitle="Your teaching priorities, learner activity and academic tools in one workspace.">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 p-7 shadow-lg md:p-9">
        <DailyBrief name={displayName} subtitle="Focus on what needs your attention today and let Medi help with the repetitive work.">
          <div className="flex flex-wrap gap-3">
            <Button className="bg-white text-emerald-700 hover:bg-emerald-50" onClick={() => navigate("/tutor/lessons/new")}>
              <PlusCircle size={18} /> Create Lesson
            </Button>
            <Button className="border-white/40 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate("/tutor/ai-assistant")}>
              <Sparkles size={18} /> Ask Medi
            </Button>
          </div>
        </DailyBrief>
      </div>

      <WidgetGrid className="mt-6">
        <StatWidget title="Pending Marking" value={loading ? "…" : pendingMarking} helper="Submissions awaiting release" icon={ClipboardCheck} tone="amber" />
        <StatWidget title="Clinical Reviews" value={loading ? "…" : pendingClinical} helper="Submitted logbook entries" icon={Stethoscope} tone="teal" />
        <StatWidget title="Today's Registers" value={loading ? "…" : attendanceToday} helper="Attendance sessions recorded" icon={CalendarCheck} tone="green" />
        <StatWidget title="Unread Updates" value={loading ? "…" : unreadCount} helper={`${conversations.length} active conversations`} icon={Bell} tone="purple" />
      </WidgetGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Quick Actions" description="Start common tutor tasks immediately" className="xl:col-span-2">
          <QuickActions
            actions={[
              { label: "Create Lesson", description: "Build learning content", icon: BookOpen, onClick: () => navigate("/tutor/lessons/new") },
              { label: "Create Assessment", description: "Build a quiz or CAT", icon: ClipboardCheck, onClick: () => navigate("/tutor/quizzes/builder") },
              { label: "Take Attendance", description: "Load the class register", icon: CalendarCheck, onClick: () => navigate("/tutor/attendance") },
              { label: "Question Bank", description: "Create reusable questions", icon: HelpCircle, onClick: () => navigate("/tutor/questions") },
              { label: "Announcements", description: "Publish an academic notice", icon: Megaphone, onClick: () => navigate("/tutor/announcements") },
              { label: "Ask Medi", description: "Generate teaching materials", icon: Sparkles, onClick: () => navigate("/tutor/ai-assistant") },
            ]}
          />
        </DashboardWidget>

        <MediInsight
          title="Teaching recommendation"
          message={
            pendingMarking > 0
              ? `You have ${pendingMarking} submission${pendingMarking === 1 ? "" : "s"} awaiting marking or release. Clear the oldest attempts first, then use Medi to prepare targeted remediation.`
              : pendingClinical > 0
                ? `Your marking queue is clear. ${pendingClinical} clinical entr${pendingClinical === 1 ? "y is" : "ies are"} awaiting review.`
                : "Your immediate review queues are clear. This is a good time to prepare a revision activity or strengthen an upcoming lesson."
          }
          actionLabel={pendingMarking > 0 ? "Open submissions" : pendingClinical > 0 ? "Review logbooks" : "Open Medi"}
          onAction={() => navigate(pendingMarking > 0 ? "/tutor/submissions" : pendingClinical > 0 ? "/tutor/clinical-logbook" : "/tutor/ai-assistant")}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Today's Teaching" description="Your scheduled sessions" className="xl:col-span-2">
          <MyDay items={todaySchedule} />
        </DashboardWidget>
        <DashboardWidget title="Recent Learner Activity" description="Latest submissions requiring awareness">
          <ActivityFeed items={recentActivity} />
        </DashboardWidget>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <WorkspaceCard title="Academic Management" icon={GraduationCap} items={[
          ["Programmes", "/tutor/programmes"],
          ["Course Units", "/tutor/course-units"],
          ["Modules", "/tutor/modules"],
          ["Lessons", "/tutor/lessons"],
        ]} navigate={navigate} />
        <WorkspaceCard title="Assessment Centre" icon={FileText} items={[
          ["Assessment Workspace", "/tutor/assessments"],
          ["Question Bank", "/tutor/questions"],
          ["Assessment Bank", "/tutor/quizzes"],
          ["Examination Bank", "/tutor/exams"],
        ]} navigate={navigate} />
        <WorkspaceCard title="Learner Management" icon={Users} items={[
          ["Students", "/tutor/students"],
          ["Enrolments", "/tutor/enrollments"],
          ["Gradebook", "/tutor/gradebook"],
          ["Class Analytics", "/tutor/class-analytics"],
        ]} navigate={navigate} />
        <WorkspaceCard title="Clinical & Schedule" icon={Stethoscope} items={[
          ["Clinical Logbook", "/tutor/clinical-logbook"],
          ["Attendance", "/tutor/attendance"],
          ["Timetable", "/tutor/timetable"],
          ["Messages", "/tutor/messages"],
        ]} navigate={navigate} />
        <WorkspaceCard title="Institution Tools" icon={WalletCards} items={[
          ["Finance", "/tutor/finance"],
          ["Announcements", "/tutor/announcements"],
          ["Notifications", "/tutor/notifications"],
          ["Analytics", "/tutor/class-analytics"],
        ]} navigate={navigate} />
        <WorkspaceCard title="Curriculum Builder" icon={LibraryBig} items={[
          ["Curriculum Explorer", "/tutor/curriculum"],
          ["Lessons", "/tutor/lessons"],
          ["Universal Builder", "/tutor/quizzes/builder"],
          ["Examination Builder", "/tutor/exams/builder"],
        ]} navigate={navigate} />
      </div>

      {notifications.length > 0 && (
        <p className="mt-6 text-center text-sm text-slate-500">Latest update: {notifications[0].title}</p>
      )}
    </TutorLayout>
  );
}

function WorkspaceCard({
  title,
  icon: Icon,
  items,
  navigate,
}: {
  title: string;
  icon: React.ElementType;
  items: [string, string][];
  navigate: ReturnType<typeof useNavigate>;
}) {
  return (
    <DashboardWidget title={title} action={<Icon className="text-emerald-700" size={24} />}>
      <div className="grid gap-2 sm:grid-cols-2">
        {items.map(([label, path]) => (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className="rounded-xl bg-slate-50 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-800"
          >
            {label}
          </button>
        ))}
      </div>
    </DashboardWidget>
  );
}
