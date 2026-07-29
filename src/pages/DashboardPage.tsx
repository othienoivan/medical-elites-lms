import {
  Award,
  Bell,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  ClipboardCheck,
  ClipboardList,
  LogOut,
  MessageCircle,
  PlayCircle,
  Sparkles,
  Stethoscope,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import ActivityFeed from "../components/dashboard/ActivityFeed";
import DailyBrief from "../components/dashboard/DailyBrief";
import DashboardShell from "../components/dashboard/DashboardShell";
import DashboardWidget from "../components/dashboard/DashboardWidget";
import MediInsight from "../components/dashboard/MediInsight";
import MyDay from "../components/dashboard/MyDay";
import QuickActions from "../components/dashboard/QuickActions";
import StatWidget from "../components/dashboard/StatWidget";
import WidgetGrid from "../components/dashboard/WidgetGrid";
import NotificationBell from "../components/NotificationBell";
import Button from "../components/ui/Button";
import { logoutUser } from "../firebase/auth";
import useAuth from "../hooks/useAuth";
import useCourseUnits from "../hooks/useCourseUnits";
import useMessages from "../hooks/useMessages";
import useNotifications from "../hooks/useNotifications";
import useQuizAttempts from "../hooks/useQuizAttempts";
import useQuizzes from "../hooks/useQuizzes";
import useStudentLearningAccess from "../hooks/useStudentLearningAccess";
import useTimetable from "../hooks/useTimetable";

function currentDayName() {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
}

export default function DashboardPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { quizzes, loading: quizzesLoading } = useQuizzes();
  const { courseUnits, loading: courseUnitsLoading } = useCourseUnits();
  const { attempts, loading: attemptsLoading } = useQuizAttempts();
  const { entries: timetableEntries, loading: timetableLoading } = useTimetable();
  const { conversations, loading: messagesLoading } = useMessages();
  const { notifications, unreadCount, loading: notificationsLoading } = useNotifications();
  const {
    enrollments,
    courseUnitIds,
    programmeIds,
    loading: accessLoading,
    canAccessQuiz,
  } = useStudentLearningAccess();

  const assignedCourseUnits = useMemo(
    () =>
      courseUnits.filter(
        (courseUnit) =>
          courseUnitIds.has(courseUnit.id) ||
          programmeIds.has(courseUnit.programmeId)
      ),
    [courseUnitIds, courseUnits, programmeIds]
  );

  const completedAssessmentKeys = useMemo(() => {
    const keys = new Set<string>();
    attempts.forEach((attempt) => {
      if (attempt.quizId) keys.add(`id:${attempt.quizId}`);
      const title = attempt.quizTitle?.trim().toLowerCase();
      if (title) keys.add(`title:${title}`);
    });
    return keys;
  }, [attempts]);

  const availableQuizzes = useMemo(
    () =>
      quizzes.filter((quiz) => {
        const completed =
          completedAssessmentKeys.has(`id:${quiz.id}`) ||
          completedAssessmentKeys.has(`title:${quiz.title.trim().toLowerCase()}`);
        return quiz.status === "published" && canAccessQuiz(quiz) && !quiz.isArchived && !completed;
      }),
    [canAccessQuiz, completedAssessmentKeys, quizzes]
  );

  const overallProgress = useMemo(() => {
    if (enrollments.length === 0) return 0;
    return Math.round(
      enrollments.reduce((sum, item) => sum + (item.progress ?? 0), 0) /
        enrollments.length
    );
  }, [enrollments]);

  const todaySchedule = useMemo(() => {
    const day = currentDayName().toLowerCase();
    return timetableEntries
      .filter(
        (entry) =>
          entry.status === "scheduled" &&
          entry.dayOfWeek.toLowerCase() === day &&
          courseUnitIds.has(entry.courseUnitId)
      )
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .slice(0, 5)
      .map((entry) => ({
        id: entry.id,
        time: entry.startTime,
        title: entry.courseUnitTitle,
        meta: entry.venue || "Venue to be confirmed",
      }));
  }, [courseUnitIds, timetableEntries]);

  const recentActivity = useMemo(() => {
    const attemptItems = attempts
      .slice(0, 3)
      .map((attempt) => ({
        id: `attempt-${attempt.id}`,
        title: `${attempt.quizTitle || "Assessment"} submitted`,
        detail: `${Math.round(attempt.finalPercentage ?? attempt.percentage ?? 0)}% recorded`,
      }));
    const notificationItems = notifications
      .slice(0, 2)
      .map((notification) => ({
        id: `notification-${notification.id}`,
        title: notification.title,
        detail: notification.body,
      }));
    return [...notificationItems, ...attemptItems].slice(0, 5);
  }, [attempts, notifications]);

  const loading =
    quizzesLoading ||
    courseUnitsLoading ||
    attemptsLoading ||
    accessLoading ||
    timetableLoading ||
    messagesLoading ||
    notificationsLoading;

  const displayName = userProfile?.fullName?.split(" ")[0] || currentUser?.email?.split("@")[0] || "Student";

  async function handleLogout() {
    await logoutUser();
    navigate("/login");
  }

  return (
    <DashboardShell
      tone="student"
      header={
        <DailyBrief
          name={displayName}
          subtitle="Your learning, assessments, timetable and academic progress—organized for today."
        >
          <div className="flex flex-wrap items-center gap-3">
            <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => navigate("/student/course-units")}>
              <PlayCircle size={18} /> Continue Learning
            </Button>
            <Button className="border-white/40 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate("/ai-assistant")}>
              <Sparkles size={18} /> Ask Medi
            </Button>
            <NotificationBell />
            <Button className="border-white/40 bg-white/10 text-white hover:bg-white/20" onClick={handleLogout}>
              <LogOut size={18} /> Logout
            </Button>
          </div>
        </DailyBrief>
      }
    >
      <WidgetGrid>
        <StatWidget title="Course Units" value={loading ? "…" : assignedCourseUnits.length} helper="Assigned through active enrolment" icon={BookOpen} tone="blue" />
        <StatWidget title="Learning Progress" value={loading ? "…" : `${overallProgress}%`} helper="Across active enrolments" icon={TrendingUp} tone="green" />
        <StatWidget title="Upcoming Assessments" value={loading ? "…" : availableQuizzes.length} helper="Published and not yet submitted" icon={ClipboardCheck} tone="amber" />
        <StatWidget title="Unread Updates" value={loading ? "…" : unreadCount} helper={`${conversations.length} active conversations`} icon={Bell} tone="purple" />
      </WidgetGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Quick Actions" description="Your most-used academic tools" className="xl:col-span-2">
          <QuickActions
            actions={[
              { label: "My Courses", description: "Continue assigned lessons", icon: BookOpen, onClick: () => navigate("/student/course-units") },
              { label: "Assessments", description: "Take quizzes and exams", icon: ClipboardCheck, onClick: () => navigate("/assessments") },
              { label: "Ask Medi", description: "Get structured study support", icon: Sparkles, onClick: () => navigate("/ai-assistant") },
              { label: "Timetable", description: "See classes and venues", icon: CalendarDays, onClick: () => navigate("/timetable") },
              { label: "Messages", description: "Contact your tutors", icon: MessageCircle, onClick: () => navigate("/messages") },
              { label: "Finance", description: "View statement and receipts", icon: WalletCards, onClick: () => navigate("/finance") },
            ]}
          />
        </DashboardWidget>

        <MediInsight
          message={
            availableQuizzes.length > 0
              ? `You have ${availableQuizzes.length} assessment${availableQuizzes.length === 1 ? "" : "s"} waiting. Review the related lesson before you begin.`
              : "You have no pending assessment right now. Use this opportunity to review a weak topic or generate practice questions."
          }
          actionLabel={availableQuizzes.length > 0 ? "View assessments" : "Start a Medi session"}
          onAction={() => navigate(availableQuizzes.length > 0 ? "/assessments" : "/ai-assistant")}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="My Day" description="Today's scheduled learning" className="xl:col-span-2">
          <MyDay items={todaySchedule} />
        </DashboardWidget>

        <DashboardWidget title="Learning Snapshot" description="Your current priorities">
          <div className="space-y-3">
            <SnapshotRow icon={CalendarCheck} label="Attendance" value="Open record" onClick={() => navigate("/attendance")} />
            <SnapshotRow icon={Stethoscope} label="Clinical logbook" value="View progress" onClick={() => navigate("/clinical-logbook")} />
            <SnapshotRow icon={ClipboardList} label="Assessment history" value={`${attempts.length} attempts`} onClick={() => navigate("/assessment-history")} />
            <SnapshotRow icon={Award} label="Achievements" value="Coming soon" />
          </div>
        </DashboardWidget>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Continue Learning" description="Your active course units" className="xl:col-span-2">
          {loading ? (
            <p className="text-sm text-slate-500">Loading your learning journey…</p>
          ) : assignedCourseUnits.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-7 text-center text-slate-600">No course units have been assigned to your active enrolment yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {assignedCourseUnits.slice(0, 4).map((courseUnit) => (
                <button
                  key={courseUnit.id}
                  type="button"
                  onClick={() => navigate(`/courses/${courseUnit.slug}`)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm"
                >
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-700">{courseUnit.code || "Course unit"}</p>
                  <h3 className="mt-2 font-bold text-slate-950">{courseUnit.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{courseUnit.programmeTitle}</p>
                </button>
              ))}
            </div>
          )}
        </DashboardWidget>

        <DashboardWidget title="Recent Activity" description="Latest academic updates">
          <ActivityFeed items={recentActivity} />
        </DashboardWidget>
      </div>
    </DashboardShell>
  );
}

function SnapshotRow({
  icon: Icon,
  label,
  value,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex w-full items-center justify-between gap-3 rounded-2xl bg-slate-50 p-4 text-left transition enabled:hover:bg-blue-50 disabled:cursor-default"
    >
      <span className="flex items-center gap-3 font-semibold text-slate-800"><Icon size={19} className="text-blue-700" /> {label}</span>
      <span className="text-sm text-slate-500">{value}</span>
    </button>
  );
}
