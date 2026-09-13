import { Activity, BookOpen, Building2, CircleDollarSign, GraduationCap, KeyRound, LifeBuoy, ReceiptText, Sparkles, Users } from "lucide-react";
import { useEffect, useState } from "react";
import PlatformLayout from "../../components/platform/PlatformLayout";
import PlatformMetric from "../../components/platform/PlatformMetric";
import PlatformCard from "../../components/platform/PlatformCard";
import EmptyPlatformState from "../../components/platform/EmptyPlatformState";
import { getPlatformOverviewSnapshot, type PlatformOverviewSnapshot } from "../../firebase/platformAdminDashboard";

export default function PlatformDashboardPage() {
  const [data, setData] = useState<PlatformOverviewSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void getPlatformOverviewSnapshot().then(setData).catch((caught) => setError(caught instanceof Error ? caught.message : "Unable to load platform data.")).finally(() => setLoading(false)); }, []);
  const value = (number?: number) => loading ? "…" : (number ?? 0).toLocaleString();
  return <PlatformLayout title="Platform Overview" subtitle="Live Medical Elites operational data across users, learning, subscriptions, commerce and support.">
    {error && <div className="mb-5 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</div>}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <PlatformMetric label="Registered users" value={value(data?.users)} helper={`${data?.activeUsers ?? 0} active`} icon={Users}/>
      <PlatformMetric label="Students" value={value(data?.students)} helper="Canonical student records" icon={GraduationCap}/>
      <PlatformMetric label="Tutors" value={value(data?.tutors)} helper={`${data?.independentTutorTenants ?? 0} independent tutor workspaces`} icon={Users}/>
      <PlatformMetric label="Tenants" value={value(data?.tenants)} helper={`${data?.institutionTenants ?? 0} institutions`} icon={Building2}/>
      <PlatformMetric label="Active plans" value={value(data?.activePlans)} helper={`${data?.plans ?? 0} plans created`} icon={ReceiptText}/>
      <PlatformMetric label="Active subscriptions" value={value(data?.activeSubscriptions)} helper={`${data?.trialSubscriptions ?? 0} trials`} icon={KeyRound}/>
      <PlatformMetric label="Course units" value={value(data?.courseUnits)} helper={`${data?.modules ?? 0} modules · ${data?.lessons ?? 0} lessons`} icon={BookOpen}/>
      <PlatformMetric label="Assessments" value={value(data?.quizzes)} helper="Quiz / assessment records" icon={Activity}/>
      <PlatformMetric label="Marketplace products" value={value(data?.marketplaceProducts)} helper={`${data?.fulfilledOrders ?? 0} fulfilled orders`} icon={ReceiptText}/>
      <PlatformMetric label="Commerce revenue" value={loading ? "…" : `${data?.currency ?? "UGX"} ${(data?.grossCommerceRevenue ?? 0).toLocaleString()}`} helper="Verified fulfilled orders" icon={CircleDollarSign}/>
      <PlatformMetric label="Open support" value={value(data?.supportOpen)} helper="Open and in-progress tickets" icon={LifeBuoy}/>
      <PlatformMetric label="AI requests" value={value(data?.aiRequests)} helper="Recorded Medi / AI usage" icon={Sparkles}/>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-3">
      <PlatformCard title="Platform composition" description="Live academic and account records" className="xl:col-span-1">
        <div className="space-y-3 text-sm">
          {[['Programmes',data?.programmes],['Modules',data?.modules],['Lessons',data?.lessons],['Notifications',data?.notifications],['Administrators',data?.admins]].map(([label,count]) => <div key={String(label)} className="flex justify-between rounded-xl bg-slate-50 p-3"><span>{label}</span><strong>{loading?'…':Number(count ?? 0).toLocaleString()}</strong></div>)}
        </div>
      </PlatformCard>
      <PlatformCard title="Recent platform activity" description="Latest commerce, notification and AI events" className="xl:col-span-2">
        {!data?.recentActivity?.length ? <EmptyPlatformState message={loading ? "Loading recent platform activity…" : "No recent platform activity has been recorded yet."}/> : <div className="space-y-3">{data.recentActivity.map((item) => <div key={item.id} className="rounded-2xl border p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-bold text-slate-950">{item.title}</p><p className="mt-1 text-sm text-slate-500">{item.detail}</p></div>{item.createdAt && <span className="text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</span>}</div></div>)}</div>}
      </PlatformCard>
    </div>
  </PlatformLayout>;
}
