import { Activity, Building2, Flag, KeyRound, LifeBuoy, ReceiptText, Sparkles, Users } from "lucide-react";
import PlatformLayout from "../../components/platform/PlatformLayout";
import PlatformMetric from "../../components/platform/PlatformMetric";
import PlatformCard from "../../components/platform/PlatformCard";
import EmptyPlatformState from "../../components/platform/EmptyPlatformState";
import { PlatformService } from "../../domains/platform";
import { usePlatformRecords } from "../../domains/platform/presentation/usePlatformRecords";

export default function PlatformDashboardPage() {
  const tenants = usePlatformRecords(PlatformService.listTenants);
  const plans = usePlatformRecords(PlatformService.listPlans);
  const tickets = usePlatformRecords(PlatformService.listTickets);
  const flags = usePlatformRecords(PlatformService.listFlags);
  const usage = usePlatformRecords(PlatformService.listUsage);
  const licenses = usePlatformRecords(PlatformService.listLicenses);
  const aiRequests = usage.records.reduce((sum, row) => sum + Number(row.aiRequests || 0), 0);
  const students = usage.records.reduce((sum, row) => sum + Number(row.activeStudents || 0), 0);
  const tutors = usage.records.reduce((sum, row) => sum + Number(row.activeTutors || 0), 0);
  const openTickets = tickets.records.filter((item) => item.status === "open" || item.status === "in_progress").length;
  return <PlatformLayout title="Platform Overview" subtitle="Operate institutions, independent tutors, licensing, feature access, support and platform usage without changing the stable LMS runtime.">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <PlatformMetric label="Tenants" value={tenants.loading ? "…" : tenants.records.length} helper="Institutions and tutor workspaces" icon={Building2}/>
      <PlatformMetric label="Active plans" value={plans.loading ? "…" : plans.records.filter((item) => item.status === "active").length} helper="Commercial packages" icon={ReceiptText}/>
      <PlatformMetric label="Active licenses" value={licenses.loading ? "…" : licenses.records.filter((item) => item.status === "active" || item.status === "trial").length} helper="Trials, subscriptions and grants" icon={KeyRound}/>
      <PlatformMetric label="Support queue" value={tickets.loading ? "…" : openTickets} helper="Open and in-progress tickets" icon={LifeBuoy}/>
      <PlatformMetric label="Learners reported" value={students} helper="Latest usage ledgers" icon={Users}/>
      <PlatformMetric label="Tutors reported" value={tutors} helper="Latest usage ledgers" icon={Users}/>
      <PlatformMetric label="AI requests" value={aiRequests} helper="Metered platform usage" icon={Sparkles}/>
      <PlatformMetric label="Enabled flags" value={flags.records.filter((item) => item.enabled).length} helper="Controlled feature rollouts" icon={Flag}/>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-3">
      <PlatformCard title="Tenant health" description="Operational status across workspaces" className="xl:col-span-2">
        {tenants.records.length === 0 ? <EmptyPlatformState message="No platform tenants have been created yet."/> : <div className="space-y-3">{tenants.records.slice(0, 8).map((tenant) => <div key={tenant.id} className="flex items-center justify-between rounded-2xl border p-4"><div><p className="font-bold text-slate-950">{tenant.name}</p><p className="text-sm text-slate-500">{tenant.type.replaceAll("_", " ")} · {tenant.planId || "No plan"}</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-700">{tenant.status}</span></div>)}</div>}
      </PlatformCard>
      <PlatformCard title="Operations status" description="RC3 platform layer readiness"><div className="space-y-3">{[
        ["Stable LMS runtime", true], ["Platform DDD boundary", true], ["Tenant manager", true], ["Plan configuration", true], ["Feature flags", true], ["Commerce processing", false], ["Marketplace sales", false],
      ].map(([label, ready]) => <div key={String(label)} className="flex items-center justify-between rounded-xl bg-slate-50 p-3"><span className="text-sm font-semibold text-slate-700">{label}</span><span className={`text-xs font-black ${ready ? "text-emerald-700" : "text-amber-700"}`}>{ready ? "READY" : "NEXT RELEASE"}</span></div>)}</div></PlatformCard>
    </div>
    <div className="mt-6"><PlatformCard title="Platform activity" description="Audit events will appear here once operational actions are recorded"><div className="flex items-center gap-3 rounded-2xl bg-cyan-50 p-5 text-cyan-900"><Activity/><p className="font-semibold">RC3 isolates platform operations from academic collections. Existing institution learning workflows remain unchanged.</p></div></PlatformCard></div>
  </PlatformLayout>;
}
