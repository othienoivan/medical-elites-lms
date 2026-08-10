import {
  AlertTriangle,
  CheckCircle2,
  Download,
  HeartPulse,
  RefreshCw,
  Sparkles,
  Trash2,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import DailyBrief from "../components/dashboard/DailyBrief";
import DashboardShell from "../components/dashboard/DashboardShell";
import DashboardWidget from "../components/dashboard/DashboardWidget";
import WidgetGrid from "../components/dashboard/WidgetGrid";
import Button from "../components/ui/Button";
import {
  runCoreDiagnostics,
  runMediDiagnostic,
  type DiagnosticCheck,
  type DiagnosticStatus,
} from "../firebase/diagnostics";
import useAuth from "../hooks/useAuth";
import usePlatformMetrics from "../hooks/usePlatformMetrics";
import {
  clearDiagnosticErrors,
  getDiagnosticErrors,
} from "../utils/appDiagnostics";

const founderEmail = (
  import.meta.env.VITE_FOUNDER_EMAIL || "admin@medicalelites.org"
).trim().toLowerCase();

const releaseChecklist = [
  "Authentication and role protection",
  "Academic structure",
  "Lessons and document delivery",
  "Assessments and marking",
  "Attendance and timetable",
  "Finance and receipts",
  "Messaging and notifications",
  "Clinical logbook",
  "Medi AI",
  "Public website and legal pages",
];

export default function FounderDiagnosticsPage() {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const { metrics, loading: metricsLoading } = usePlatformMetrics();
  const [checks, setChecks] = useState<DiagnosticCheck[]>([]);
  const [running, setRunning] = useState(false);
  const [mediRunning, setMediRunning] = useState(false);
  const [errors, setErrors] = useState(() => getDiagnosticErrors());

  const statusSummary = useMemo(() => {
    const count = (status: DiagnosticStatus) =>
      checks.filter((check) => check.status === status).length;
    return {
      healthy: count("healthy"),
      warning: count("warning"),
      error: count("error"),
    };
  }, [checks]);

  if (
    !currentUser ||
    currentUser.email?.toLowerCase() !== founderEmail ||
    userProfile?.role !== "admin"
  ) {
    return <Navigate to="/unauthorized?reason=founder" replace />;
  }

  async function handleRunDiagnostics() {
    setRunning(true);
    setChecks(await runCoreDiagnostics());
    setErrors(getDiagnosticErrors());
    setRunning(false);
  }

  async function handleRunMediCheck() {
    setMediRunning(true);
    const result = await runMediDiagnostic();
    setChecks((current) => [
      ...current.filter((check) => check.id !== result.id),
      result,
    ]);
    setMediRunning(false);
  }

  function handleClearErrors() {
    clearDiagnosticErrors();
    setErrors([]);
  }

  function exportReport() {
    const report = {
      generatedAt: new Date().toISOString(),
      version: "1.1.0-alpha.7",
      environment: import.meta.env.DEV ? "development" : "production",
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      checks,
      metrics,
      recentErrors: errors,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `medical-elites-health-report-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <DashboardShell
      tone="founder"
      header={
        <DailyBrief
          name={userProfile.fullName?.split(" ")[0] || "Ivan"}
          subtitle="QA & Diagnostics Centre — verify platform services, inspect recent errors and assess institutional readiness."
        />
      }
    >
      <div className="mb-6 flex flex-wrap gap-3">
        <Button loading={running} onClick={handleRunDiagnostics}>
          <RefreshCw size={18} /> Run Core Checks
        </Button>
        <Button variant="outline" loading={mediRunning} onClick={handleRunMediCheck}>
          <Sparkles size={18} /> Test Medi
        </Button>
        <Button variant="outline" onClick={exportReport} disabled={!checks.length}>
          <Download size={18} /> Export Health Report
        </Button>
        <Button variant="ghost" onClick={() => navigate("/founder")}>Back to Founder Dashboard</Button>
      </div>

      <WidgetGrid>
        <SummaryCard label="Healthy" value={statusSummary.healthy} status="healthy" />
        <SummaryCard label="Warnings" value={statusSummary.warning} status="warning" />
        <SummaryCard label="Failures" value={statusSummary.error} status="error" />
        <SummaryCard label="Recent Errors" value={errors.length} status={errors.length ? "warning" : "healthy"} />
      </WidgetGrid>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Service Health" description="Live checks for the current browser session" className="xl:col-span-2">
          {checks.length === 0 ? (
            <EmptyState text="Run the core checks to inspect Authentication, Firestore, Storage, network and offline support." />
          ) : (
            <div className="space-y-3">
              {checks.map((check) => <HealthRow key={check.id} check={check} />)}
            </div>
          )}
        </DashboardWidget>

        <DashboardWidget title="Build Information" description="Current release context">
          <InfoRow label="Version" value="1.1.0-alpha.7" />
          <InfoRow label="Environment" value={import.meta.env.DEV ? "Development" : "Production"} />
          <InfoRow label="Project" value={import.meta.env.VITE_FIREBASE_PROJECT_ID || "Not configured"} />
          <InfoRow label="Online" value={navigator.onLine ? "Yes" : "No"} />
          <InfoRow label="Browser" value={navigator.userAgent.split(" ").slice(-2).join(" ")} />
        </DashboardWidget>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <DashboardWidget title="Institution Readiness" description="Configuration indicators from existing platform data" className="xl:col-span-2">
          <div className="grid gap-3 sm:grid-cols-2">
            <ReadinessItem label="Registered students" ready={metrics.students > 0} value={metricsLoading ? "…" : String(metrics.students)} />
            <ReadinessItem label="Registered tutors" ready={metrics.tutors > 0} value={metricsLoading ? "…" : String(metrics.tutors)} />
            <ReadinessItem label="Programmes configured" ready={metrics.programmes > 0} value={metricsLoading ? "…" : String(metrics.programmes)} />
            <ReadinessItem label="Course units configured" ready={metrics.courseUnits > 0} value={metricsLoading ? "…" : String(metrics.courseUnits)} />
            <ReadinessItem label="Assessments available" ready={metrics.quizzes > 0} value={metricsLoading ? "…" : String(metrics.quizzes)} />
            <ReadinessItem label="Attendance in use" ready={metrics.attendanceSessions > 0} value={metricsLoading ? "…" : String(metrics.attendanceSessions)} />
            <ReadinessItem label="Finance activity" ready={metrics.payments > 0} value={metricsLoading ? "…" : String(metrics.payments)} />
            <ReadinessItem label="Medi usage" ready={metrics.aiSessions > 0} value={metricsLoading ? "…" : String(metrics.aiSessions)} />
          </div>
        </DashboardWidget>

        <DashboardWidget title="Release Certification" description="Version 1.0 workflow checklist">
          <div className="space-y-2">
            {releaseChecklist.map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
                <CheckCircle2 size={17} className="text-emerald-600" /> {item}
              </div>
            ))}
          </div>
        </DashboardWidget>
      </div>

      <DashboardWidget title="Recent Application Errors" description="Browser-side errors retained locally on this device" className="mt-6">
        <div className="mb-4 flex justify-end">
          <Button variant="danger" size="sm" onClick={handleClearErrors} disabled={!errors.length}>
            <Trash2 size={16} /> Clear Error Log
          </Button>
        </div>
        {errors.length === 0 ? (
          <EmptyState text="No recent browser-side errors are recorded on this device." />
        ) : (
          <div className="space-y-3">
            {errors.map((error) => (
              <div key={error.id} className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-red-900">{error.source}</p>
                  <time className="text-xs text-red-700">{new Date(error.occurredAt).toLocaleString()}</time>
                </div>
                <p className="mt-2 text-sm text-red-800">{error.message}</p>
              </div>
            ))}
          </div>
        )}
      </DashboardWidget>
    </DashboardShell>
  );
}

function SummaryCard({ label, value, status }: { label: string; value: number; status: DiagnosticStatus }) {
  const classes = {
    healthy: "border-emerald-200 bg-emerald-50 text-emerald-800",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
    error: "border-red-200 bg-red-50 text-red-800",
  }[status];
  return <div className={`rounded-2xl border p-5 ${classes}`}><p className="text-sm font-semibold">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>;
}

function HealthRow({ check }: { check: DiagnosticCheck }) {
  const Icon = check.status === "healthy" ? CheckCircle2 : check.status === "warning" ? AlertTriangle : XCircle;
  const classes = check.status === "healthy" ? "text-emerald-700" : check.status === "warning" ? "text-amber-700" : "text-red-700";
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
      <Icon className={classes} size={22} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-bold text-slate-950">{check.label}</p>
          <span className="text-xs font-semibold text-slate-500">{check.durationMs} ms</span>
        </div>
        <p className="mt-1 text-sm text-slate-600">{check.detail}</p>
      </div>
    </div>
  );
}

function ReadinessItem({ label, ready, value }: { label: string; ready: boolean; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
      <div className="flex items-center gap-3">
        {ready ? <CheckCircle2 className="text-emerald-600" size={20} /> : <AlertTriangle className="text-amber-600" size={20} />}
        <span className="text-sm font-semibold text-slate-700">{label}</span>
      </div>
      <span className="text-lg font-bold text-slate-950">{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-3 text-sm last:border-0"><span className="font-semibold text-slate-500">{label}</span><span className="max-w-[60%] break-words text-right font-bold text-slate-900">{value}</span></div>;
}

function EmptyState({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-600"><HeartPulse className="mx-auto mb-3 text-slate-400" size={32} />{text}</div>;
}
