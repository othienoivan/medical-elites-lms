import {
  Activity,
  Building2,
  Code2,
  Gauge,
  GitBranch,
  HeartPulse,
  MessagesSquare,
  Rocket,
  Settings2,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";

import ActivityFeed from "../components/dashboard/ActivityFeed";
import DailyBrief from "../components/dashboard/DailyBrief";
import DashboardShell from "../components/dashboard/DashboardShell";
import DashboardWidget from "../components/dashboard/DashboardWidget";
import MediInsight from "../components/dashboard/MediInsight";
import QuickActions from "../components/dashboard/QuickActions";
import StatWidget from "../components/dashboard/StatWidget";
import SystemHealthWidget from "../components/dashboard/SystemHealthWidget";
import WidgetGrid from "../components/dashboard/WidgetGrid";
import useAuth from "../hooks/useAuth";
import usePlatformMetrics from "../hooks/usePlatformMetrics";

const founderEmail = (
  import.meta.env.VITE_FOUNDER_EMAIL || "admin@medicalelites.org"
).trim().toLowerCase();

function money(value: number) {
  return `UGX ${value.toLocaleString()}`;
}

export default function FounderDashboardPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { metrics, activity, loading, error } = usePlatformMetrics();

  if (!currentUser || currentUser.email?.toLowerCase() !== founderEmail || userProfile?.role !== "admin") {
    return <Navigate to="/unauthorized?reason=founder" replace />;
  }

  const displayName = userProfile.fullName?.split(" ")[0] || "Ivan";

  return (
    <DashboardShell
      tone="founder"
      header={
        <DailyBrief
          name={displayName}
          subtitle="Medical Elites Command Centre — platform health, growth, AI usage, business activity and release oversight."
        />
      }
    >
      {error && <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <WidgetGrid>
        <StatWidget title="Platform Users" value={loading ? "…" : metrics.users} helper={`${metrics.students} students · ${metrics.tutors} tutors`} icon={Users} tone="blue" />
        <StatWidget title="Institutions" value="1" helper="Single-institution launch edition" icon={Building2} tone="purple" />
        <StatWidget title="Recorded Revenue" value={loading ? "…" : money(metrics.revenue)} helper={`${metrics.payments} finance transactions`} icon={WalletCards} tone="amber" />
        <StatWidget title="Medi Sessions" value={loading ? "…" : metrics.aiSessions} helper="AI usage logged platform-wide" icon={Sparkles} tone="teal" />
      </WidgetGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Founder Actions" description="Platform, business and release controls" className="xl:col-span-2">
          <QuickActions
            actions={[
              { label: "Administrator View", description: "Institution command centre", icon: ShieldCheck, onClick: () => navigate("/admin") },
              { label: "Tutor Workspace", description: "Teaching operations", icon: Users, onClick: () => navigate("/tutor") },
              { label: "System Diagnostics", description: "Review service health", icon: HeartPulse, onClick: () => navigate("/founder/diagnostics") },
              { label: "Medi Analytics", description: "Review AI adoption", icon: Sparkles, onClick: () => navigate("/tutor/ai-assistant") },
              { label: "Public Enquiries", description: `${metrics.newContactRequests} new requests`, icon: MessagesSquare, onClick: () => navigate("/contact") },
              { label: "Release Workspace", description: "Version and roadmap", icon: GitBranch, onClick: () => navigate("/founder#release") },
            ]}
          />
        </DashboardWidget>

        <MediInsight
          title="Founder insight"
          message={`Medical Elites currently serves ${metrics.students} registered students and ${metrics.tutors} tutors. ${metrics.newContactRequests} new website enquiries and ${metrics.aiSessions} Medi sessions are recorded.`}
          actionLabel="Open Medi"
          onAction={() => navigate("/tutor/ai-assistant")}
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Platform Health" description="Current operational status" className="xl:col-span-1">
          <SystemHealthWidget />
        </DashboardWidget>

        <DashboardWidget title="Growth and Business" description="Launch-edition performance indicators" className="xl:col-span-2">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FounderMetric icon={Rocket} label="Version" value="1.1 Alpha 4" />
            <FounderMetric icon={Gauge} label="Active Users" value={String(metrics.activeUsers)} />
            <FounderMetric icon={MessagesSquare} label="Demo / Contact Requests" value={String(metrics.contactRequests)} />
            <FounderMetric icon={Activity} label="Attendance Registers" value={String(metrics.attendanceSessions)} />
            <FounderMetric icon={Code2} label="Release Channel" value="Dashboard 2.0" />
            <FounderMetric icon={Settings2} label="Pending Tutor Requests" value={String(metrics.pendingTutorRequests)} />
          </div>
        </DashboardWidget>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Latest Platform Activity" description="Recent finance, AI and website events" className="xl:col-span-2">
          <ActivityFeed items={activity} />
        </DashboardWidget>

        <DashboardWidget title="Release Notes" description="Medical Elites Experience roadmap">
          <div className="space-y-3 text-sm text-slate-700">
            <ReleaseItem title="Dashboard 2.0 Alpha 1" status="Completed" />
            <ReleaseItem title="Admin + Founder Alpha 2" status="Completed" />
            <ReleaseItem title="QA Diagnostics Alpha 4" status="Current" />
            <ReleaseItem title="Medi Everywhere" status="Next" />
            <ReleaseItem title="Advanced Analytics" status="Planned" />
          </div>
        </DashboardWidget>
      </div>
    </DashboardShell>
  );
}

function FounderMetric({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <Icon className="text-amber-700" size={21} />
      <p className="mt-3 text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function ReleaseItem({ title, status }: { title: string; status: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
      <span className="font-semibold">{title}</span>
      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">{status}</span>
    </div>
  );
}
