import {
  Activity,
  BookOpen,
  ClipboardCheck,
  GraduationCap,
  Landmark,
  MessageSquareText,
  ReceiptText,
  Settings,
  Sparkles,
  UserCog,
  Users,
  WalletCards,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import ActivityFeed from "../components/dashboard/ActivityFeed";
import DailyBrief from "../components/dashboard/DailyBrief";
import DashboardWidget from "../components/dashboard/DashboardWidget";
import MediInsight from "../components/dashboard/MediInsight";
import QuickActions from "../components/dashboard/QuickActions";
import StatWidget from "../components/dashboard/StatWidget";
import SystemHealthWidget from "../components/dashboard/SystemHealthWidget";
import WidgetGrid from "../components/dashboard/WidgetGrid";
import AdminLayout from "../components/layout/AdminLayout";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";
import usePlatformMetrics from "../hooks/usePlatformMetrics";

function money(value: number) {
  return `UGX ${value.toLocaleString()}`;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { metrics, activity, loading, error, reload } = usePlatformMetrics();

  const displayName =
    userProfile?.fullName?.split(" ")[0] ||
    currentUser?.email?.split("@")[0] ||
    "Administrator";

  return (
    <AdminLayout
      title="Institution Dashboard"
      subtitle="Manage academic setup, users, operations, finance and institutional health."
    >
      <div className="overflow-hidden rounded-3xl bg-gradient-to-r from-violet-800 via-purple-800 to-indigo-800 p-7 shadow-lg md:p-9">
      <DailyBrief
        name={displayName}
        subtitle="Monitor institutional performance, people, finance, learning delivery and platform health."
      >
        <div className="flex flex-wrap gap-3">
          <Button className="bg-white text-violet-700 hover:bg-violet-50" onClick={() => navigate("/tutor/students/register")}>Register Student</Button>
          <Button className="border-white/40 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate("/admin/academic-years")}>Academic Setup</Button>
          <Button className="border-white/40 bg-white/10 text-white hover:bg-white/20" onClick={() => void reload()}>Refresh</Button>
        </div>
      </DailyBrief>
      </div>
      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <WidgetGrid>
        <StatWidget title="Students" value={loading ? "…" : metrics.students} helper={`${metrics.activeUsers} active platform users`} icon={GraduationCap} tone="blue" />
        <StatWidget title="Tutors" value={loading ? "…" : metrics.tutors} helper={`${metrics.admins} administrator accounts`} icon={UserCog} tone="green" />
        <StatWidget title="Revenue Recorded" value={loading ? "…" : money(metrics.revenue)} helper={`${metrics.payments} payment records`} icon={WalletCards} tone="amber" />
        <StatWidget title="Outstanding Fees" value={loading ? "…" : money(metrics.outstandingBalance)} helper="Across all current invoices" icon={ReceiptText} tone="rose" />
      </WidgetGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Administrative Actions" description="Frequently used institution-management tools" className="xl:col-span-2">
          <QuickActions
            actions={[
              { label: "Student Directory", description: "Manage learner records", icon: Users, onClick: () => navigate("/tutor/students") },
              { label: "Programmes", description: "Academic programme catalogue", icon: Landmark, onClick: () => navigate("/admin/programmes") },
              { label: "Course Units", description: "Manage teaching structure", icon: BookOpen, onClick: () => navigate("/admin/course-units") },
              { label: "Finance", description: "Billing, payments and clearance", icon: WalletCards, onClick: () => navigate("/tutor/finance") },
              { label: "Analytics", description: "Institution performance", icon: Activity, onClick: () => navigate("/tutor/class-analytics") },
              { label: "Announcements", description: "Publish institution updates", icon: MessageSquareText, onClick: () => navigate("/tutor/announcements") },
            ]}
          />
        </DashboardWidget>

        <MediInsight
          title="Institution insight"
          message={
            metrics.outstandingBalance > 0
              ? `Outstanding student balances total ${money(metrics.outstandingBalance)}. Consider reviewing overdue invoices and sending targeted reminders.`
              : "All current invoices are financially cleared. Review attendance and academic performance for the next institutional priority."
          }
          actionLabel="Analyze with Medi"
          onAction={() => navigate("/tutor/ai-assistant")}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Academic Operations" description="Live institutional activity indicators" className="xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MiniMetric icon={Landmark} label="Programmes" value={metrics.programmes} />
            <MiniMetric icon={BookOpen} label="Course Units" value={metrics.courseUnits} />
            <MiniMetric icon={ClipboardCheck} label="Assessments" value={metrics.quizzes} />
            <MiniMetric icon={Activity} label="Attendance Registers" value={metrics.attendanceSessions} />
            <MiniMetric icon={Sparkles} label="Medi Sessions" value={metrics.aiSessions} />
            <MiniMetric icon={MessageSquareText} label="New Enquiries" value={metrics.newContactRequests} />
          </div>
        </DashboardWidget>

        <DashboardWidget title="System Health" description="Operational service status">
          <SystemHealthWidget />
        </DashboardWidget>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Recent Platform Activity" description="Latest finance, website and Medi events" className="xl:col-span-2">
          <ActivityFeed items={activity} />
        </DashboardWidget>

        <DashboardWidget title="Administration Summary" description="Items that may require attention">
          <div className="space-y-3">
            <SummaryRow label="Pending tutor requests" value={metrics.pendingTutorRequests} />
            <SummaryRow label="New contact requests" value={metrics.newContactRequests} />
            <SummaryRow label="Total users" value={metrics.users} />
            <SummaryRow label="AI sessions" value={metrics.aiSessions} />
          </div>
          <button type="button" onClick={() => navigate("/founder")} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-violet-700 hover:underline">
            <Settings size={17} /> Open Founder Command Centre
          </button>
        </DashboardWidget>
      </div>
    </AdminLayout>
  );
}

function MiniMetric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="text-violet-700" size={21} />
      <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-bold text-violet-700">{value}</span>
    </div>
  );
}
