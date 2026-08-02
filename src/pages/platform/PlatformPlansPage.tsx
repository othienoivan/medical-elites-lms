import { useMemo, useState } from "react";
import PlatformLayout from "../../components/platform/PlatformLayout";
import PlatformCard from "../../components/platform/PlatformCard";
import { ENTITLEMENT_KEYS, type EntitlementKey, type Plan } from "../../models/Plan";
import { listPlatformRecords } from "../../domains/platform/infrastructure/platformRepository";
import { usePlatformRecords } from "../../domains/platform/presentation/usePlatformRecords";
import { saveSubscriptionPlan } from "../../firebase/subscriptionAdmin";

const emptyLimits = { maxStudents: 100, maxTutors: 5, maxCourseUnits: 10, storageBytes: 5 * 1024 ** 3, monthlyAiCredits: 100 };

export default function PlatformPlansPage() {
  const state = usePlatformRecords<Plan>(() => listPlatformRecords<Plan>("plans"));
  const [selected, setSelected] = useState<Plan | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const current = useMemo(() => selected ?? ({ enabledEntitlements: [], limits: emptyLimits } as Partial<Plan>), [selected]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (busy) return;
    setBusy(true); setMessage(null);
    const fd = new FormData(form);
    try {
      await saveSubscriptionPlan({
        planId: selected?.id,
        name: String(fd.get("name") || ""), code: String(fd.get("code") || ""),
        audience: String(fd.get("audience")) as Plan["audience"], status: String(fd.get("status")) as "draft"|"active"|"retired",
        billingInterval: String(fd.get("billingInterval")) as Plan["billingInterval"], priceMinor: Math.round(Number(fd.get("price")) * 100),
        currency: String(fd.get("currency") || "UGX"), commissionBasisPoints: Math.round(Number(fd.get("commission")) * 100),
        enabledEntitlements: ENTITLEMENT_KEYS.filter(key => fd.get(key) === "on") as EntitlementKey[],
        limits: { maxStudents:Number(fd.get("maxStudents")), maxTutors:Number(fd.get("maxTutors")), maxCourseUnits:Number(fd.get("maxCourseUnits")), storageBytes:Number(fd.get("storageGb"))*1024**3, monthlyAiCredits:Number(fd.get("monthlyAiCredits")) },
        trialDays: Number(fd.get("trialDays")), description: String(fd.get("description") || "") || undefined,
      });
      setMessage("Plan saved successfully."); setSelected(null); form.reset(); await state.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save plan."); }
    finally { setBusy(false); }
  }

  return <PlatformLayout title="Subscription Plans" subtitle="Configure pricing, trials, entitlements and usage limits through trusted backend controls.">
    <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      <PlatformCard title="Plan catalogue"><div className="space-y-3">{state.records.map(plan=><button key={plan.id} onClick={()=>setSelected(plan)} className="w-full rounded-xl border p-4 text-left hover:bg-slate-50"><div className="flex justify-between"><b>{plan.name}</b><span className="capitalize">{plan.status ?? (plan.isActive?"active":"draft")}</span></div><p className="text-sm text-slate-500">{plan.audience} · {plan.currency} {(plan.priceMinor/100).toLocaleString()} / {plan.billingInterval}</p><p className="mt-1 text-xs text-slate-500">{plan.enabledEntitlements?.length ?? 0} entitlements</p></button>)}</div></PlatformCard>
      <PlatformCard title={selected?"Edit plan":"Create plan"}><form onSubmit={submit} className="space-y-3">
        <input name="name" required defaultValue={current.name ?? ""} placeholder="Plan name" className="w-full rounded-xl border p-3"/>
        <input name="code" required defaultValue={current.code ?? ""} placeholder="plan_code" className="w-full rounded-xl border p-3"/>
        <div className="grid grid-cols-2 gap-3"><select name="audience" defaultValue={current.audience ?? "institution"} className="rounded-xl border p-3"><option value="institution">Institution</option><option value="tutor">Tutor</option><option value="student">Student</option></select><select name="status" defaultValue={current.status ?? (current.isActive?"active":"draft")} className="rounded-xl border p-3"><option value="draft">Draft</option><option value="active">Active</option><option value="retired">Retired</option></select></div>
        <div className="grid grid-cols-2 gap-3"><select name="billingInterval" defaultValue={current.billingInterval ?? "monthly"} className="rounded-xl border p-3"><option value="monthly">Monthly</option><option value="annual">Annual</option><option value="none">Free</option></select><input name="currency" defaultValue={current.currency ?? "UGX"} className="rounded-xl border p-3"/></div>
        <div className="grid grid-cols-2 gap-3"><input name="price" type="number" min="0" defaultValue={(current.priceMinor ?? 0)/100} placeholder="Price" className="rounded-xl border p-3"/><input name="commission" type="number" min="0" max="100" defaultValue={(current.commissionBasisPoints ?? 5000)/100} placeholder="Commission %" className="rounded-xl border p-3"/></div>
        <div className="grid grid-cols-2 gap-3">{([['maxStudents','Students'],['maxTutors','Tutors'],['maxCourseUnits','Course units'],['monthlyAiCredits','AI credits']] as const).map(([key,label])=><input key={key} name={key} type="number" defaultValue={current.limits?.[key] ?? emptyLimits[key]} placeholder={`Max ${label}`} className="rounded-xl border p-3"/>)}<input name="storageGb" type="number" defaultValue={(current.limits?.storageBytes ?? emptyLimits.storageBytes)/1024**3} placeholder="Storage GB" className="rounded-xl border p-3"/><input name="trialDays" type="number" defaultValue={current.trialDays ?? 14} placeholder="Trial days" className="rounded-xl border p-3"/></div>
        <textarea name="description" defaultValue={current.description ?? ""} placeholder="Description" className="w-full rounded-xl border p-3"/>
        <div className="grid gap-2 sm:grid-cols-2">{ENTITLEMENT_KEYS.map(key=><label key={key} className="flex items-center gap-2 text-sm"><input type="checkbox" name={key} defaultChecked={current.enabledEntitlements?.includes(key)}/>{key.replaceAll("_"," ")}</label>)}</div>
        {message&&<p className="rounded-xl bg-slate-100 p-3 text-sm">{message}</p>}<div className="flex gap-3"><button disabled={busy} className="rounded-xl bg-cyan-600 px-4 py-2 font-bold text-white">{busy?"Saving...":"Save plan"}</button>{selected&&<button type="button" onClick={()=>setSelected(null)} className="rounded-xl border px-4 py-2">Cancel edit</button>}</div>
      </form></PlatformCard>
    </div>
  </PlatformLayout>;
}
