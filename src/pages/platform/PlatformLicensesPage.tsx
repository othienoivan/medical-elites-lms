import { useMemo, useState } from "react";
import PlatformLayout from "../../components/platform/PlatformLayout";
import PlatformCard from "../../components/platform/PlatformCard";
import { assignTenantSubscription, updateTenantSubscriptionStatus } from "../../firebase/subscriptionAdmin";
import { listPlatformRecords } from "../../domains/platform/infrastructure/platformRepository";
import { usePlatformRecords } from "../../domains/platform/presentation/usePlatformRecords";
import type { Plan, TenantSubscription } from "../../models/Plan";
import type { Tenant } from "../../models/Tenant";

function isActivePlan(plan: Plan): boolean {
  return plan.status === "active" || plan.isActive === true;
}

export default function PlatformLicensesPage() {
  const subscriptions = usePlatformRecords<TenantSubscription>(() => listPlatformRecords<TenantSubscription>("subscriptions"));
  const plans = usePlatformRecords<Plan>(() => listPlatformRecords<Plan>("plans"));
  const tenants = usePlatformRecords<Tenant>(() => listPlatformRecords<Tenant>("tenants"));
  const activePlans = useMemo(() => plans.records.filter(isActivePlan), [plans.records]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function assign(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const fd = new FormData(form);
    const planId = String(fd.get("planId") || "");
    if (!activePlans.some((plan) => plan.id === planId)) {
      setMessage("Choose an active subscription plan.");
      return;
    }
    setBusy(true); setMessage(null);
    try {
      await assignTenantSubscription({
        tenantId: String(fd.get("tenantId")), planId,
        status: String(fd.get("status")) as "trialing" | "active",
        trialDays: Number(fd.get("trialDays")),
      });
      setMessage("Subscription assigned.");
      await subscriptions.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to assign subscription.");
    } finally { setBusy(false); }
  }

  async function change(tenantId: string, status: "active"|"past_due"|"cancelled"|"expired"|"suspended") {
    setBusy(true);
    try { await updateTenantSubscriptionStatus({ tenantId, status }); await subscriptions.refresh(); }
    finally { setBusy(false); }
  }

  return <PlatformLayout title="Tenant Subscriptions" subtitle="Assign plans, start trials and control tenant subscription status.">
    <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
      <PlatformCard title="Assign subscription"><form onSubmit={assign} className="space-y-3">
        <select name="tenantId" required className="w-full rounded-xl border p-3" defaultValue=""><option value="" disabled>Select tenant</option>{tenants.records.map(t=><option key={t.id} value={t.id}>{t.name} ({t.id})</option>)}</select>
        <select name="planId" required className="w-full rounded-xl border p-3" defaultValue=""><option value="" disabled>Select active plan</option>{activePlans.map(p=><option key={p.id} value={p.id}>{p.name} · {p.currency} {(p.priceMinor/100).toLocaleString()}</option>)}</select>
        <select name="status" className="w-full rounded-xl border p-3"><option value="trialing">Trial</option><option value="active">Active</option></select>
        <input name="trialDays" type="number" defaultValue="14" className="w-full rounded-xl border p-3"/>
        {message&&<p className="rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}
        <button disabled={busy || activePlans.length===0} className="rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white">{busy?"Assigning...":"Assign"}</button>
      </form></PlatformCard>
      <PlatformCard title="Subscriptions"><div className="space-y-3">{subscriptions.records.map(s=><div key={s.id} className="rounded-xl border p-4"><div className="flex justify-between"><b>{s.tenantId}</b><span className="capitalize">{s.status}</span></div><p className="text-sm text-slate-500">{s.planId}</p><div className="mt-3 flex flex-wrap gap-2">{(["active","past_due","suspended","cancelled","expired"] as const).map(status=><button key={status} disabled={busy||s.status===status} onClick={()=>void change(s.tenantId,status)} className="rounded-lg border px-2 py-1 text-xs capitalize">{status.replace("_"," ")}</button>)}</div></div>)}</div></PlatformCard>
    </div>
  </PlatformLayout>;
}
