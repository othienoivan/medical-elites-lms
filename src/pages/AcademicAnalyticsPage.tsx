import { BarChart3, BookOpen, ClipboardCheck, RefreshCw, Stethoscope, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AnalyticsKpiGrid from "../components/analytics/AnalyticsKpiGrid";
import ActivityFeed from "../components/dashboard/ActivityFeed";
import DashboardShell from "../components/dashboard/DashboardShell";
import DashboardWidget from "../components/dashboard/DashboardWidget";
import DailyBrief from "../components/dashboard/DailyBrief";
import QuickActions from "../components/dashboard/QuickActions";
import Button from "../components/ui/Button";
import useAuth from "../hooks/useAuth";
import { getAcademicAnalytics, type AnalyticsRole, type AnalyticsSnapshot } from "../services/analytics";

export default function AcademicAnalyticsPage() {
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const role = (userProfile?.role || "student") as AnalyticsRole;

  async function load(forceRefresh = false) {
    if (!currentUser) return;
    setLoading(true);
    const result = await getAcademicAnalytics({
      role,
      userId: currentUser.uid,
      institutionId: userProfile?.institutionId,
      forceRefresh,
    });
    setSnapshot(result);
    setLoading(false);
  }

  useEffect(() => { void load(); }, [currentUser?.uid, role, userProfile?.institutionId]);

  return (
    <DashboardShell
      tone={role === "student" ? "student" : "tutor"}
      header={
        <DailyBrief
          name="Academic Analytics"
          subtitle="Role-aware institutional intelligence, KPI monitoring and recent academic activity."
        >
          <Button className="bg-white text-blue-700 hover:bg-blue-50" onClick={() => void load(true)} disabled={loading}>
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Refresh metrics
          </Button>
        </DailyBrief>
      }
    >
      {snapshot ? <AnalyticsKpiGrid kpis={snapshot.kpis} /> : <p className="text-sm text-slate-500">Loading analytics…</p>}

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Analytics Quick Actions" description="Open the operational records behind the metrics" className="xl:col-span-2">
          <QuickActions actions={[
            { label: "Students", description: "Open student records", icon: Users, onClick: () => navigate(role === "student" ? "/student/course-units" : "/tutor/students") },
            { label: "Assessments", description: "Review academic assessments", icon: ClipboardCheck, onClick: () => navigate(role === "student" ? "/assessments" : "/tutor/assessments") },
            { label: "Curriculum", description: "Inspect curriculum delivery", icon: BookOpen, onClick: () => navigate(role === "admin" ? "/admin/curriculum-designer" : "/curriculum") },
            { label: "Clinical", description: "Open competency evidence", icon: Stethoscope, onClick: () => navigate(role === "student" ? "/clinical-logbook" : "/tutor/clinical-logbook") },
            { label: "Class Analytics", description: "Detailed performance workspace", icon: BarChart3, onClick: () => navigate("/tutor/class-analytics") },
          ]} />
        </DashboardWidget>

        <DashboardWidget title="Snapshot Status" description="How these metrics were produced">
          <dl className="space-y-4 text-sm">
            <div><dt className="font-semibold text-slate-800">Source</dt><dd className="text-slate-500">{snapshot?.source || "Loading"}</dd></div>
            <div><dt className="font-semibold text-slate-800">Institution</dt><dd className="break-all text-slate-500">{snapshot?.institutionId || "Resolving"}</dd></div>
            <div><dt className="font-semibold text-slate-800">Generated</dt><dd className="text-slate-500">{snapshot?.generatedAt.toLocaleString() || "—"}</dd></div>
            <div><dt className="font-semibold text-slate-800">Cache policy</dt><dd className="text-slate-500">Five-minute client cache with manual refresh.</dd></div>
          </dl>
        </DashboardWidget>
      </div>

      <div className="mt-6">
        <DashboardWidget title="Recent Academic Activity" description="Permission-scoped events relevant to the signed-in user">
          <ActivityFeed items={(snapshot?.activity || []).map((item) => ({ id: item.id, title: item.title, detail: item.detail }))} />
        </DashboardWidget>
      </div>
    </DashboardShell>
  );
}
