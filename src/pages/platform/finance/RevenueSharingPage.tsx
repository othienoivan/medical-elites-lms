import { useEffect, useMemo, useState } from "react";
import PlatformLayout from "../../../components/platform/PlatformLayout";
import { FinanceService, type CommissionRule } from "../../../domains/finance";

type Scope = "global" | "institution" | "tutor" | "course";
const emptyRule = { name: "Global marketplace default", scope: "global" as Scope, scopeId: "global", platformPercent: 20, institutionPercent: 10, tutorPercent: 70, priority: 0, active: true };

export default function RevenueSharingPage() {
  const [rules, setRules] = useState<CommissionRule[]>([]);
  const [amount, setAmount] = useState(20000);
  const [form, setForm] = useState(emptyRule);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function reload() {
    setError("");
    try { setRules(await FinanceService.list<CommissionRule>("commissionRules")); }
    catch (e: unknown) { setError(e instanceof Error ? e.message : "Unable to load commission rules."); }
  }
  useEffect(() => { void reload(); }, []);

  const total = form.platformPercent + form.institutionPercent + form.tutorPercent;
  const previewRule = useMemo<CommissionRule>(() => ({ id: "preview", ...form }), [form]);
  const preview = useMemo(() => {
    if (!amount || Math.abs(total - 100) > 0.001) return null;
    try { return FinanceService.calculateSplit(amount, previewRule); } catch { return null; }
  }, [amount, previewRule, total]);

  function setNumber(key: "platformPercent" | "institutionPercent" | "tutorPercent" | "priority", value: string) {
    setForm((current) => ({ ...current, [key]: Number(value) || 0 }));
  }

  async function saveRule() {
    setMessage(""); setError("");
    if (Math.abs(total - 100) > 0.001) { setError("Platform, institution and tutor percentages must total exactly 100%."); return; }
    const scopeId = form.scope === "global" ? "global" : form.scopeId.trim();
    if (!scopeId) { setError("A scope ID is required for institution, tutor and course rules."); return; }
    setSaving(true);
    try {
      await FinanceService.upsertCommissionRule({ rule: { ...form, scopeId }, idempotencyKey: FinanceService.makeIdempotencyKey("commission") });
      setMessage("Revenue sharing rule saved. Verified marketplace payments will use the most specific active rule automatically.");
      await reload();
    } catch (e: unknown) { setError(e instanceof Error ? e.message : "Unable to save revenue sharing rule."); }
    finally { setSaving(false); }
  }

  return (
    <PlatformLayout title="Revenue Sharing" subtitle="Configure and preview automatic platform, institution and tutor revenue allocation.">
      {error && <p className="mb-4 rounded-xl bg-red-50 p-4 text-red-700">{error}</p>}
      {message && <p className="mb-4 rounded-xl bg-emerald-50 p-4 text-emerald-700">{message}</p>}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Configure allocation rule</h2>
          <p className="mt-1 text-sm text-slate-500">Priority: Course → Tutor → Institution → Global. The most specific active rule wins.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <label className="text-sm font-bold text-slate-700">Rule name<input value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
            <label className="text-sm font-bold text-slate-700">Scope<select value={form.scope} onChange={(e)=>setForm({...form,scope:e.target.value as Scope,scopeId:e.target.value === "global" ? "global" : ""})} className="mt-2 w-full rounded-xl border px-4 py-3"><option value="global">Global</option><option value="institution">Institution</option><option value="tutor">Tutor</option><option value="course">Course / Course Unit</option></select></label>
            {form.scope !== "global" && <label className="text-sm font-bold text-slate-700 md:col-span-2">{form.scope === "institution" ? "Institution ID" : form.scope === "tutor" ? "Tutor UID" : "Course Unit ID"}<input value={form.scopeId} onChange={(e)=>setForm({...form,scopeId:e.target.value})} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>}
            <label className="text-sm font-bold text-slate-700">Platform %<input type="number" min="0" max="100" step="0.01" value={form.platformPercent} onChange={(e)=>setNumber("platformPercent",e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
            <label className="text-sm font-bold text-slate-700">Institution %<input type="number" min="0" max="100" step="0.01" value={form.institutionPercent} onChange={(e)=>setNumber("institutionPercent",e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
            <label className="text-sm font-bold text-slate-700">Tutor %<input type="number" min="0" max="100" step="0.01" value={form.tutorPercent} onChange={(e)=>setNumber("tutorPercent",e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
            <label className="text-sm font-bold text-slate-700">Priority<input type="number" min="0" value={form.priority} onChange={(e)=>setNumber("priority",e.target.value)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
          </div>
          <div className={`mt-5 rounded-xl p-4 ${Math.abs(total-100)<0.001 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}><strong>Total allocation: {total.toFixed(2)}%</strong><p className="mt-1 text-sm">Rules cannot be activated unless allocation totals 100%.</p></div>
          <label className="mt-4 flex items-center gap-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.active} onChange={(e)=>setForm({...form,active:e.target.checked})} />Active rule</label>
          <button onClick={()=>void saveRule()} disabled={saving || Math.abs(total-100)>0.001} className="mt-5 rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : "Save revenue rule"}</button>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-950">Live allocation preview</h2>
          <label className="mt-5 block text-sm font-bold text-slate-700">Sale amount (UGX)<input type="number" min={1} value={amount} onChange={(e)=>setAmount(Number(e.target.value)||0)} className="mt-2 w-full rounded-xl border px-4 py-3" /></label>
          {preview ? <div className="mt-6 space-y-3">{Object.entries(preview).map(([key,value])=><div key={key} className="flex justify-between rounded-xl bg-slate-50 p-4"><span className="capitalize">{key}</span><strong>UGX {value.toLocaleString()}</strong></div>)}<div className="flex justify-between border-t pt-4"><span>Total</span><strong>UGX {amount.toLocaleString()}</strong></div></div> : <p className="mt-5 text-slate-500">Enter a valid 100% allocation to preview the split.</p>}
          <p className="mt-5 rounded-xl bg-blue-50 p-4 text-sm leading-6 text-blue-800">For independent tutors with no institution, the institution share is automatically added to the tutor share so the verified payment is still allocated in full.</p>
        </section>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-lg font-black">Active and saved rules</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-2">{rules.map((rule)=><article key={rule.id} className="rounded-xl border p-4"><div className="flex items-start justify-between gap-3"><div><strong>{rule.name}</strong><p className="mt-1 text-xs text-slate-500">{rule.scope ?? "global"}: {rule.scopeId ?? "global"}</p></div><span className={`rounded-full px-2 py-1 text-xs font-bold ${rule.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{rule.active ? "ACTIVE" : "INACTIVE"}</span></div><p className="mt-3 text-sm text-slate-600">Platform {rule.platformPercent}% · Institution {rule.institutionPercent}% · Tutor {rule.tutorPercent}%</p></article>)}{rules.length===0&&<p className="text-slate-500">No commission rules yet. Save the global default above to activate automatic allocation.</p>}</div>
      </section>
    </PlatformLayout>
  );
}
